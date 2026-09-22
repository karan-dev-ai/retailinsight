package com.retailinsight.repository;

import com.retailinsight.model.SaleOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleOrderItemRepository extends JpaRepository<SaleOrderItem, Long> {

    @Query("SELECT item.productId, item.productName, SUM(item.quantity), SUM(item.itemTotal), SUM(item.itemProfit) " +
           "FROM SaleOrderItem item JOIN item.saleOrder so " +
           "WHERE so.retailerId = :retailerId " +
           "GROUP BY item.productId, item.productName " +
           "ORDER BY SUM(item.quantity) DESC")
    List<Object[]> findTopSellingProducts(@Param("retailerId") Long retailerId);

    @Query("SELECT item.productId, item.productName, SUM(item.quantity), SUM(item.itemTotal), SUM(item.itemProfit) " +
           "FROM SaleOrderItem item JOIN item.saleOrder so " +
           "WHERE so.retailerId = :retailerId " +
           "GROUP BY item.productId, item.productName " +
           "ORDER BY SUM(item.itemProfit) DESC")
    List<Object[]> findTopProfitableProducts(@Param("retailerId") Long retailerId);

    @Query("SELECT item.productId, SUM(item.quantity), SUM(item.itemTotal), SUM(item.itemProfit), MAX(so.createdAt) " +
           "FROM SaleOrderItem item JOIN item.saleOrder so " +
           "WHERE so.retailerId = :retailerId " +
           "GROUP BY item.productId")
    List<Object[]> findProductPerformanceStats(@Param("retailerId") Long retailerId);

    @Query("SELECT p.category, SUM(item.itemTotal), SUM(item.itemProfit), SUM(item.quantity) " +
           "FROM SaleOrderItem item JOIN item.saleOrder so, Product p " +
           "WHERE so.retailerId = :retailerId AND item.productId = p.id " +
           "GROUP BY p.category " +
           "ORDER BY SUM(item.itemTotal) DESC")
    List<Object[]> findCategoryPerformance(@Param("retailerId") Long retailerId);

    @Query("SELECT DISTINCT item.productId FROM SaleOrderItem item JOIN item.saleOrder so " +
           "WHERE so.retailerId = :retailerId AND so.createdAt >= :since")
    List<Long> findProductIdsSoldSince(@Param("retailerId") Long retailerId, @Param("since") LocalDateTime since);
}
