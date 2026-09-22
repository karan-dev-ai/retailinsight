package com.retailinsight.dto;

import com.retailinsight.model.OrderStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class WholesaleDtos {

    public static class WholesaleListingRequest {
        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        @NotBlank(message = "Category is required")
        private String category;

        @NotBlank(message = "Unit description is required")
        private String unit; // e.g. "Box (24 Units)"

        @NotNull(message = "Unit price is required")
        @DecimalMin(value = "0.0", inclusive = false)
        private BigDecimal unitPrice;

        @NotNull(message = "MOQ is required")
        @Min(value = 1)
        private Integer minOrderQuantity;

        @NotNull(message = "Stock available is required")
        @Min(value = 0)
        private Integer stockAvailable;

        private BigDecimal bulkDiscountPercent;
        private Integer bulkDiscountThreshold;
        private String imageUrl;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        public Integer getMinOrderQuantity() { return minOrderQuantity; }
        public void setMinOrderQuantity(Integer minOrderQuantity) { this.minOrderQuantity = minOrderQuantity; }
        public Integer getStockAvailable() { return stockAvailable; }
        public void setStockAvailable(Integer stockAvailable) { this.stockAvailable = stockAvailable; }
        public BigDecimal getBulkDiscountPercent() { return bulkDiscountPercent; }
        public void setBulkDiscountPercent(BigDecimal bulkDiscountPercent) { this.bulkDiscountPercent = bulkDiscountPercent; }
        public Integer getBulkDiscountThreshold() { return bulkDiscountThreshold; }
        public void setBulkDiscountThreshold(Integer bulkDiscountThreshold) { this.bulkDiscountThreshold = bulkDiscountThreshold; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    public static class PurchaseOrderRequest {
        @NotNull(message = "Listing ID is required")
        private Long listingId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1)
        private Integer quantity;

        private Long retailerProductId; // If linked, auto-update retailer inventory when DELIVERED
        private Integer unitsPerWholesalePack; // e.g. 24
        private String notes;

        public Long getListingId() { return listingId; }
        public void setListingId(Long listingId) { this.listingId = listingId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public Long getRetailerProductId() { return retailerProductId; }
        public void setRetailerProductId(Long retailerProductId) { this.retailerProductId = retailerProductId; }
        public Integer getUnitsPerWholesalePack() { return unitsPerWholesalePack; }
        public void setUnitsPerWholesalePack(Integer unitsPerWholesalePack) { this.unitsPerWholesalePack = unitsPerWholesalePack; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class PurchaseOrderStatusUpdateRequest {
        @NotNull(message = "Status is required")
        private OrderStatus status;

        private String trackingNumber;
        private String notes;

        public OrderStatus getStatus() { return status; }
        public void setStatus(OrderStatus status) { this.status = status; }
        public String getTrackingNumber() { return trackingNumber; }
        public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class WholesaleSummaryDto {
        private long totalListings;
        private long pendingOrders;
        private long confirmedOrders;
        private long deliveredOrders;
        private BigDecimal totalWholesaleRevenue;

        public long getTotalListings() { return totalListings; }
        public void setTotalListings(long totalListings) { this.totalListings = totalListings; }
        public long getPendingOrders() { return pendingOrders; }
        public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }
        public long getConfirmedOrders() { return confirmedOrders; }
        public void setConfirmedOrders(long confirmedOrders) { this.confirmedOrders = confirmedOrders; }
        public long getDeliveredOrders() { return deliveredOrders; }
        public void setDeliveredOrders(long deliveredOrders) { this.deliveredOrders = deliveredOrders; }
        public BigDecimal getTotalWholesaleRevenue() { return totalWholesaleRevenue; }
        public void setTotalWholesaleRevenue(BigDecimal totalWholesaleRevenue) { this.totalWholesaleRevenue = totalWholesaleRevenue; }
    }
}
