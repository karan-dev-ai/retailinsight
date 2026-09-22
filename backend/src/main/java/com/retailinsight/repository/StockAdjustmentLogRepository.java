package com.retailinsight.repository;

import com.retailinsight.model.StockAdjustmentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockAdjustmentLogRepository extends JpaRepository<StockAdjustmentLog, Long> {

    List<StockAdjustmentLog> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<StockAdjustmentLog> findByRetailerIdOrderByCreatedAtDesc(Long retailerId);
}
