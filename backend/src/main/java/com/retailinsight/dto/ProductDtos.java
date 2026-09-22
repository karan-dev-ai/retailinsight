package com.retailinsight.dto;

import com.retailinsight.model.AdjustmentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ProductDtos {

    public static class ProductRequest {
        @NotBlank(message = "Product name is required")
        private String name;

        @NotBlank(message = "SKU is required")
        private String sku;

        private String barcode;

        @NotBlank(message = "Category is required")
        private String category;

        @NotNull(message = "Cost price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Cost price must be greater than 0")
        private BigDecimal costPrice;

        @NotNull(message = "Selling price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Selling price must be greater than 0")
        private BigDecimal sellingPrice;

        @NotNull(message = "Stock quantity is required")
        @Min(value = 0, message = "Stock quantity cannot be negative")
        private Integer stockQuantity;

        @NotNull(message = "Min stock threshold is required")
        @Min(value = 0, message = "Threshold cannot be negative")
        private Integer minStockThreshold;

        private String unit;
        private String description;
        private String imageUrl;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSku() { return sku; }
        public void setSku(String sku) { this.sku = sku; }
        public String getBarcode() { return barcode; }
        public void setBarcode(String barcode) { this.barcode = barcode; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public BigDecimal getCostPrice() { return costPrice; }
        public void setCostPrice(BigDecimal costPrice) { this.costPrice = costPrice; }
        public BigDecimal getSellingPrice() { return sellingPrice; }
        public void setSellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; }
        public Integer getStockQuantity() { return stockQuantity; }
        public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
        public Integer getMinStockThreshold() { return minStockThreshold; }
        public void setMinStockThreshold(Integer minStockThreshold) { this.minStockThreshold = minStockThreshold; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    public static class StockAdjustmentRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity change is required")
        private Integer changeQty;

        @NotNull(message = "Adjustment type is required")
        private AdjustmentType type;

        private String reason;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Integer getChangeQty() { return changeQty; }
        public void setChangeQty(Integer changeQty) { this.changeQty = changeQty; }
        public AdjustmentType getType() { return type; }
        public void setType(AdjustmentType type) { this.type = type; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
