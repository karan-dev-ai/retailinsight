package com.retailinsight.repository;

import com.retailinsight.model.OrderStatus;
import com.retailinsight.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    List<PurchaseOrder> findByRetailerIdOrderByCreatedAtDesc(Long retailerId);

    List<PurchaseOrder> findByWholesalerIdOrderByCreatedAtDesc(Long wholesalerId);

    List<PurchaseOrder> findByWholesalerIdAndStatusOrderByCreatedAtDesc(Long wholesalerId, OrderStatus status);

    Optional<PurchaseOrder> findByOrderNumber(String orderNumber);

    long countByWholesalerIdAndStatus(Long wholesalerId, OrderStatus status);

    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM PurchaseOrder p WHERE p.wholesalerId = :wholesalerId AND p.status = 'DELIVERED'")
    BigDecimal getTotalWholesalerRevenue(@Param("wholesalerId") Long wholesalerId);
}
