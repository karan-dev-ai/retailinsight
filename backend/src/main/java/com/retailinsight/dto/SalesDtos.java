package com.retailinsight.dto;

import com.retailinsight.model.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public class SalesDtos {

    public static class CheckoutItemRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        private Integer quantity;

        private BigDecimal unitSellingPrice; // Optional if cashier applies custom price

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public BigDecimal getUnitSellingPrice() { return unitSellingPrice; }
        public void setUnitSellingPrice(BigDecimal unitSellingPrice) { this.unitSellingPrice = unitSellingPrice; }
    }

    public static class CheckoutRequest {
        private String customerName;
        private String customerPhone;

        @NotNull(message = "Payment method is required")
        private PaymentMethod paymentMethod;

        private BigDecimal taxRate; // e.g. 5 for 5% GST
        private BigDecimal discountAmount;

        @NotEmpty(message = "Cart cannot be empty")
        @Valid
        private List<CheckoutItemRequest> items;

        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public String getCustomerPhone() { return customerPhone; }
        public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
        public PaymentMethod getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
        public BigDecimal getTaxRate() { return taxRate; }
        public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }
        public BigDecimal getDiscountAmount() { return discountAmount; }
        public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
        public List<CheckoutItemRequest> getItems() { return items; }
        public void setItems(List<CheckoutItemRequest> items) { this.items = items; }
    }
}
