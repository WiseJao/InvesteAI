package com.InvesteAI.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class CashFlowRecurrenceJob {
    private final CashFlowRecurrenceService service;

    @Scheduled(initialDelay = 60000, fixedDelay = 900000)
    public void run() {
        for (var user : service.dueUsers()) {
            try {
                service.materialize(user);
            } catch (RuntimeException failure) {
                log.error("Falha ao gerar ocorrências de gastos fixos", failure);
            }
        }
    }
}
