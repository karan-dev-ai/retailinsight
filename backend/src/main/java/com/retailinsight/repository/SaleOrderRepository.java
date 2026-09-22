package com.retailinsight.repository;

import com.retailinsight.model.SaleOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleOrderRepository extends JpaRepository<SaleOrder, Long> {

    List<SaleOrder> findByRetailerIdOrderByCreatedAtDesc(Long retailerId);

    Optional<SaleOrder> findByOrderNumber(String orderNumber);

    List<SaleOrder> findByRetailerIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long retailerId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM SaleOrder s WHERE s.retailerId = :retailerId")
    BigDecimal getTotalRevenueByRetailerId(@Param("retailerId") Long retailerId);

    @Query("SELECT COALESCE(SUM(s.totalProfit), 0) FROM SaleOrder s WHERE s.retailerId = :retailerId")
    BigDecimal getTotalProfitByRetailerId(@Param("retailerId") Long retailerId);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM SaleOrder s WHERE s.retailerId = :retailerId AND s.createdAt >= :since")
    BigDecimal getRevenueSince(@Param("retailerId") Long retailerId, @Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(s.totalProfit), 0) FROM SaleOrder s WHERE s.retailerId = :retailerId AND s.createdAt >= :since")
    BigDecimal getProfitSince(@Param("retailerId") Long retailerId, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(s) FROM SaleOrder s WHERE s.retailerId = :retailerId AND s.createdAt >= :since")
    long countOrdersSince(@Param("retailerId") Long retailerId, @Param("since") LocalDateTime since);

    long countByRetailerId(Long retailerId);
}
