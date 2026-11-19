package com.InvesteAI.backend.interfaces;

import com.InvesteAI.backend.model.CashFlow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link CashFlow} transaction records.
 * <p>
 * Provides user-scoped queries and date-range filtering for monthly cash flow analysis.
 * </p>
 */
public interface CashFlowInterface extends JpaRepository<CashFlow, UUID> {

    /**
     * Lists all cash flow transactions for a user ordered by flow date descending.
     *
     * @param userId the UUID of the user
     * @return ordered list of {@link CashFlow} entities
     */
    List<CashFlow> findAllByUserIdOrderByFlowDateDesc(UUID userId);

    /**
     * Finds cash flow entries for a user within a specified inclusive date range.
     *
     * @param userId    the UUID of the user
     * @param startDate start date of the interval (inclusive)
     * @param endDate   end date of the interval (inclusive)
     * @return ordered list of {@link CashFlow} entities
     */
    @Query("SELECT c FROM CashFlow c WHERE c.userId = :userId AND c.flowDate BETWEEN :startDate AND :endDate ORDER BY c.flowDate DESC")
    List<CashFlow> findAllByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Finds a single cash flow entry by its ID and user ID.
     *
     * @param cashFlowId the UUID of the cash flow record
     * @param userId     the UUID of the owner user
     * @return an {@link Optional} containing the {@link CashFlow} if found
     */
    Optional<CashFlow> findByCashFlowIdAndUserId(UUID cashFlowId, UUID userId);
}
