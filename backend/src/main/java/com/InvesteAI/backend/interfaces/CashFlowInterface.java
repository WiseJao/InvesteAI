package com.InvesteAI.backend.interfaces;

import com.InvesteAI.backend.model.CashFlow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CashFlowInterface extends JpaRepository<CashFlow, UUID> {
    List<CashFlow> findAllByUserIdOrderByFlowDateDesc(UUID userId);

    @Query("SELECT c FROM CashFlow c WHERE c.userId = :userId AND c.flowDate BETWEEN :startDate AND :endDate ORDER BY c.flowDate DESC")
    List<CashFlow> findAllByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    Optional<CashFlow> findByCashFlowIdAndUserId(UUID cashFlowId, UUID userId);
}
