package com.InvesteAI.backend.interfaces;

import com.InvesteAI.backend.model.Investment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for user {@link Investment} positions.
 * <p>
 * Provides user-scoped lookup methods to query and manage portfolio holdings.
 * </p>
 */
public interface InvestmentInterface extends JpaRepository<Investment, UUID> {

    /**
     * Lists all holdings for a user ordered by purchase date descending.
     *
     * @param userId the UUID of the user
     * @return ordered list of {@link Investment} entities
     */
    List<Investment> findAllByUserIdOrderByPurchaseDateDesc(UUID userId);

    /**
     * Finds a single investment holding by its ID and user ID.
     *
     * @param investmentId the UUID of the holding
     * @param userId       the UUID of the owner user
     * @return an {@link Optional} containing the {@link Investment} if found
     */
    Optional<Investment> findByInvestmentIdAndUserId(UUID investmentId, UUID userId);
}
