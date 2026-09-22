package com.retailinsight.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_adjustment_logs")
public class StockAdjustmentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private String productName;

    private Long retailerId;

    @Column(nullable = false)
    private Integer changeQty; // positive or negative

    @Column(nullable = false)
    private Integer previousQty;

    @Column(nullable = false)
    private Integer newQty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdjustmentType type;

    private String reason;

    private LocalDateTime createdAt;

    public StockAdjustmentLog() {
        this.createdAt = LocalDateTime.now();
    }

    public StockAdjustmentLog(Long productId, String productName, Long retailerId, Integer changeQty, Integer previousQty, Integer newQty, AdjustmentType type, String reason) {
        this.productId = productId;
        this.productName = productName;
        this.retailerId = retailerId;
        this.changeQty = changeQty;
        this.previousQty = previousQty;
        this.newQty = newQty;
        this.type = type;
        this.reason = reason;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Long getRetailerId() {
        return retailerId;
    }

    public void setRetailerId(Long retailerId) {
        this.retailerId = retailerId;
    }

    public Integer getChangeQty() {
        return changeQty;
    }

    public void setChangeQty(Integer changeQty) {
        this.changeQty = changeQty;
    }

    public Integer getPreviousQty() {
        return previousQty;
    }

    public void setPreviousQty(Integer previousQty) {
        this.previousQty = previousQty;
    }

    public Integer getNewQty() {
        return newQty;
    }

    public void setNewQty(Integer newQty) {
        this.newQty = newQty;
    }

    public AdjustmentType getType() {
        return type;
    }

    public void setType(AdjustmentType type) {
        this.type = type;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
