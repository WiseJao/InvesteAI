package com.InvesteAI.backend.service;

import com.InvesteAI.backend.validation.PersistedFields;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CashFlowRecurrenceService {
    private static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");
    private final JdbcClient jdbc;

    public record Rule(UUID id, String description, String category, BigDecimal amount, LocalDate firstDate,
                       LocalDate lastDate, LocalDate nextMonth, boolean ended) {}

    public record Input(String description, String category, BigDecimal amount, LocalDate firstDate,
                        LocalDate lastDate, UUID existingCashFlowId) {}

    public List<Rule> list(UUID user) {
        return jdbc.sql("SELECT * FROM cash_flow_recurrence WHERE user_id = :user ORDER BY ended, first_date, id")
                .param("user", user).query(Rule.class).list();
    }

    public List<UUID> dueUsers() {
        return jdbc.sql("""
                SELECT DISTINCT user_id FROM cash_flow_recurrence
                WHERE NOT ended AND next_month <= :today AND (last_date IS NULL OR last_date >= next_month)
                """).param("today", today()).query(UUID.class).list();
    }

    @Transactional
    public Rule create(UUID user, Input input) {
        validate(input);
        var next = YearMonth.from(input.firstDate());
        UUID id = UUID.randomUUID();
        if (input.existingCashFlowId() != null) {
            LocalDate existingDate = jdbc.sql("""
                    SELECT flow_date FROM cash_flow WHERE cash_flow_id = :flow AND user_id = :user
                    AND direction = 'OUT' AND classification = 'FIXED' FOR UPDATE
                    """).param("flow", input.existingCashFlowId()).param("user", user).query(LocalDate.class)
                    .optional().orElseThrow(() -> PersistedFields.invalid("gasto fixo"));
            if (!existingDate.equals(input.firstDate()) || existingDate.isAfter(today())) {
                throw PersistedFields.invalid("primeiro vencimento");
            }
            if (jdbc.sql("SELECT COUNT(*) FROM cash_flow_occurrence WHERE cash_flow_id = :flow")
                    .param("flow", input.existingCashFlowId()).query(Long.class).single() > 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Este lançamento já pertence a uma recorrência.");
            }
            next = next.plusMonths(1);
        }
        jdbc.sql("""
                INSERT INTO cash_flow_recurrence (id, user_id, description, category, amount, first_date, last_date, next_month)
                VALUES (:id, :user, :description, :category, :amount, :first, :last, :next)
                """).param("id", id).param("user", user).param("description", input.description().strip())
                .param("category", input.category().strip()).param("amount", input.amount()).param("first", input.firstDate())
                .param("last", input.lastDate()).param("next", next.atDay(1)).update();
        if (input.existingCashFlowId() != null) {
            attach(id, YearMonth.from(input.firstDate()).atDay(1), input.existingCashFlowId());
        }
        materialize(user);
        return lock(user, id);
    }

    @Transactional
    public Rule update(UUID user, UUID id, Input input) {
        validate(input);
        materialize(user);
        Rule current = lock(user, id);
        if (current.ended()) throw new ResponseStatusException(HttpStatus.CONFLICT, "A recorrência foi encerrada.");
        if (!input.firstDate().equals(current.firstDate()) || input.existingCashFlowId() != null) {
            throw PersistedFields.invalid("primeiro vencimento");
        }
        jdbc.sql("""
                UPDATE cash_flow_recurrence SET description = :description, category = :category, amount = :amount,
                    last_date = :last WHERE id = :id
                """).param("id", id).param("description", input.description().strip()).param("category", input.category().strip())
                .param("amount", input.amount()).param("last", input.lastDate()).update();
        return lock(user, id);
    }

    @Transactional
    public void end(UUID user, UUID id) {
        materialize(user);
        lock(user, id);
        jdbc.sql("UPDATE cash_flow_recurrence SET ended = TRUE WHERE id = :id").param("id", id).update();
    }

    @Transactional
    public void materialize(UUID user) {
        LocalDate now = today();
        List<Rule> rules = jdbc.sql("""
                SELECT * FROM cash_flow_recurrence WHERE user_id = :user AND NOT ended AND next_month <= :today
                AND (last_date IS NULL OR last_date >= next_month) ORDER BY id FOR UPDATE
                """).param("user", user).param("today", now).query(Rule.class).list();
        for (Rule rule : rules) {
            LocalDate month = rule.nextMonth();
            YearMonth period = YearMonth.from(month);
            LocalDate due = dueDate(period, rule.firstDate().getDayOfMonth());
            while (!due.isAfter(now) && (rule.lastDate() == null || !due.isAfter(rule.lastDate()))) {
                UUID flow = UUID.randomUUID();
                jdbc.sql("""
                        INSERT INTO cash_flow (cash_flow_id, user_id, flow_date, amount, direction, description, category, classification)
                        VALUES (:flow, :user, :due, :amount, 'OUT', :description, :category, 'FIXED')
                        """).param("flow", flow).param("user", user).param("due", due).param("amount", rule.amount())
                        .param("description", rule.description()).param("category", rule.category()).update();
                attach(rule.id(), period.atDay(1), flow);
                period = period.plusMonths(1);
                due = dueDate(period, rule.firstDate().getDayOfMonth());
            }
            if (!month.equals(period.atDay(1))) {
                jdbc.sql("UPDATE cash_flow_recurrence SET next_month = :next WHERE id = :id")
                        .param("next", period.atDay(1)).param("id", rule.id()).update();
            }
        }
    }

    private static LocalDate today() { return LocalDate.now(ZONE); }

    public static LocalDate dueDate(YearMonth month, int day) {
        return month.atDay(Math.min(day, month.lengthOfMonth()));
    }

    private Rule lock(UUID user, UUID id) {
        return jdbc.sql("SELECT * FROM cash_flow_recurrence WHERE id = :id AND user_id = :user FOR UPDATE")
                .param("id", id).param("user", user).query(Rule.class).optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recorrência não encontrada."));
    }

    private void attach(UUID rule, LocalDate period, UUID flow) {
        jdbc.sql("INSERT INTO cash_flow_occurrence (recurrence_id, period, cash_flow_id) VALUES (:rule, :period, :flow)")
                .param("rule", rule).param("period", period).param("flow", flow).update();
    }

    private void validate(Input input) {
        PersistedFields.text(input.description(), 255, "descrição");
        PersistedFields.text(input.category(), 100, "categoria");
        PersistedFields.money(input.amount(), true, "valor");
        PersistedFields.dates(input.firstDate(), input.lastDate());
        if (input.firstDate().isBefore(today().minusYears(100))) throw PersistedFields.invalid("primeiro vencimento");
    }
}
