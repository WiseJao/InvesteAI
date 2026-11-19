package com.InvesteAI.backend.interfaces;

import com.InvesteAI.backend.model.Investment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvestmentInterface extends JpaRepository<Investment, UUID> {
    List<Investment> findAllByUserIdOrderByPurchaseDateDesc(UUID userId);
    Optional<Investment> findByInvestmentIdAndUserId(UUID investmentId, UUID userId);
}
