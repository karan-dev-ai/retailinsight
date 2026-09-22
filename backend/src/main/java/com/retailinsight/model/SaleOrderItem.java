package com.retailinsight.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "sale_order_items")
public class SaleOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_order_id", nullable = false)
    @JsonBackReference
    private SaleOrder saleOrder;

    private Long productId;

    @Column(nullable = false)
    private String productName;

    private String productSku;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitCostPrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitSellingPrice;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal itemTotal;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal itemCostTotal;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal itemProfit;

    public SaleOrderItem() {
    }

    public SaleOrderItem(Long productId, String productName, String productSku, BigDecimal unitCostPrice, BigDecimal unitSellingPrice, Integer quantity) {
        this.productId = productId;
        this.productName = productName;
        this.productSku = productSku;
        this.unitCostPrice = unitCostPrice != null ? unitCostPrice : BigDecimal.ZERO;
        this.unitSellingPrice = unitSellingPrice != null ? unitSellingPrice : BigDecimal.ZERO;
        this.quantity = quantity != null ? quantity : 1;
        this.itemTotal = this.unitSellingPrice.multiply(BigDecimal.valueOf(this.quantity));
        this.itemCostTotal = this.unitCostPrice.multiply(BigDecimal.valueOf(this.quantity));
        this.itemProfit = this.itemTotal.subtract(this.itemCostTotal);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SaleOrder getSaleOrder() {
        return saleOrder;
    }

    public void setSaleOrder(SaleOrder saleOrder) {
        this.saleOrder = saleOrder;
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

    public String getProductSku() {
        return productSku;
    }

    public void setProductSku(String productSku) {
        this.productSku = productSku;
    }

    public BigDecimal getUnitCostPrice() {
        return unitCostPrice;
    }

    public void setUnitCostPrice(BigDecimal unitCostPrice) {
        this.unitCostPrice = unitCostPrice;
    }

    public BigDecimal getUnitSellingPrice() {
        return unitSellingPrice;
    }

    public void setUnitSellingPrice(BigDecimal unitSellingPrice) {
        this.unitSellingPrice = unitSellingPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getItemTotal() {
        return itemTotal;
    }

    public void setItemTotal(BigDecimal itemTotal) {
        this.itemTotal = itemTotal;
    }

    public BigDecimal getItemCostTotal() {
        return itemCostTotal;
    }

    public void setItemCostTotal(BigDecimal itemCostTotal) {
        this.itemCostTotal = itemCostTotal;
    }

    public BigDecimal getItemProfit() {
        return itemProfit;
    }

    public void setItemProfit(BigDecimal itemProfit) {
        this.itemProfit = itemProfit;
    }
}
