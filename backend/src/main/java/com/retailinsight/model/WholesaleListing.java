package com.retailinsight.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wholesale_listings")
public class WholesaleListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long wholesalerId;

    @Column(nullable = false)
    private String wholesalerName;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String unit; // e.g., "Carton (24 units)", "Box (50 packs)", "Bag (25kg)"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private Integer minOrderQuantity;

    @Column(nullable = false)
    private Integer stockAvailable;

    @Column(precision = 5, scale = 2)
    private BigDecimal bulkDiscountPercent;

    private Integer bulkDiscountThreshold;

    private String imageUrl;

    private LocalDateTime createdAt;

    public WholesaleListing() {
        this.minOrderQuantity = 1;
        this.stockAvailable = 100;
        this.createdAt = LocalDateTime.now();
    }

    public WholesaleListing(Long wholesalerId, String wholesalerName, String title, String description, String category, String unit, BigDecimal unitPrice, Integer minOrderQuantity, Integer stockAvailable, BigDecimal bulkDiscountPercent, Integer bulkDiscountThreshold, String imageUrl) {
        this.wholesalerId = wholesalerId;
        this.wholesalerName = wholesalerName;
        this.title = title;
        this.description = description;
        this.category = category;
        this.unit = unit;
        this.unitPrice = unitPrice;
        this.minOrderQuantity = minOrderQuantity != null ? minOrderQuantity : 1;
        this.stockAvailable = stockAvailable != null ? stockAvailable : 100;
        this.bulkDiscountPercent = bulkDiscountPercent;
        this.bulkDiscountThreshold = bulkDiscountThreshold;
        this.imageUrl = imageUrl;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getWholesalerId() {
        return wholesalerId;
    }

    public void setWholesalerId(Long wholesalerId) {
        this.wholesalerId = wholesalerId;
    }

    public String getWholesalerName() {
        return wholesalerName;
    }

    public void setWholesalerName(String wholesalerName) {
        this.wholesalerName = wholesalerName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Integer getMinOrderQuantity() {
        return minOrderQuantity;
    }

    public void setMinOrderQuantity(Integer minOrderQuantity) {
        this.minOrderQuantity = minOrderQuantity;
    }

    public Integer getStockAvailable() {
        return stockAvailable;
    }

    public void setStockAvailable(Integer stockAvailable) {
        this.stockAvailable = stockAvailable;
    }

    public BigDecimal getBulkDiscountPercent() {
        return bulkDiscountPercent;
    }

    public void setBulkDiscountPercent(BigDecimal bulkDiscountPercent) {
        this.bulkDiscountPercent = bulkDiscountPercent;
    }

    public Integer getBulkDiscountThreshold() {
        return bulkDiscountThreshold;
    }

    public void setBulkDiscountThreshold(Integer bulkDiscountThreshold) {
        this.bulkDiscountThreshold = bulkDiscountThreshold;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
