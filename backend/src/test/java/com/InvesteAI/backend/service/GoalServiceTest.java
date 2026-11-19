package com.InvesteAI.backend.service;

import com.InvesteAI.backend.dto.goal.request.CreateGoalRequest;
import com.InvesteAI.backend.dto.goal.response.GoalResponse;
import com.InvesteAI.backend.interfaces.GoalInterface;
import com.InvesteAI.backend.model.Goal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoalServiceTest {

    @Mock
    private GoalInterface goalRepository;

    @InjectMocks
    private GoalService goalService;

    @Test
    void createsGoalSuccessfullyWithCalculatedProgress() {
        UUID userId = UUID.randomUUID();
        CreateGoalRequest request = new CreateGoalRequest(
                "Reserva de Emergência",
                null,
                "Investimentos",
                null,
                new BigDecimal("2500.00"),
                null,
                new BigDecimal("10000.00"),
                null,
                LocalDate.of(2025, 1, 1),
                LocalDate.of(2025, 12, 31),
                null
        );

        when(goalRepository.save(any(Goal.class))).thenAnswer(inv -> {
            Goal g = inv.getArgument(0);
            g.prePersist();
            return g;
        });

        GoalResponse response = goalService.create(userId, request);

        assertNotNull(response.id());
        assertEquals("Reserva de Emergência", response.name());
        assertEquals(new BigDecimal("2500.00"), response.currentValue());
        assertEquals(new BigDecimal("10000.00"), response.targetValue());
        assertEquals(25.0, response.progressPercentage());
    }
}
