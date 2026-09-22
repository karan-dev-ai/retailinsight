package com.retailinsight.service;

import com.retailinsight.dto.SalesDtos.*;
import com.retailinsight.model.*;
import com.retailinsight.repository.ProductRepository;
import com.retailinsight.repository.SaleOrderRepository;
import com.retailinsight.repository.StockAdjustmentLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
public class SalesService {

    private final SaleOrderRepository saleOrderRepository;
    private final ProductRepository productRepository;
    private final StockAdjustmentLogRepository stockLogRepository;

    public SalesService(SaleOrderRepository saleOrderRepository, ProductRepository productRepository,
                        StockAdjustmentLogRepository stockLogRepository) {
        this.saleOrderRepository = saleOrderRepository;
        this.productRepository = productRepository;
        this.stockLogRepository = stockLogRepository;
    }

    @Transactional
    public SaleOrder processCheckout(Long retailerId, CheckoutRequest req) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cannot process empty checkout");
        }

        SaleOrder order = new SaleOrder();
        order.setRetailerId(retailerId);
        order.setOrderNumber(generateOrderNumber());
        order.setCustomerName(req.getCustomerName() != null && !req.getCustomerName().trim().isEmpty() 
                ? req.getCustomerName().trim() : "Walk-in Customer");
        order.setCustomerPhone(req.getCustomerPhone());
        order.setPaymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : PaymentMethod.CASH);

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;

        for (CheckoutItemRequest itemReq : req.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + itemReq.getProductId()));

            int reqQty = itemReq.getQuantity();
            if (reqQty <= 0) {
                throw new IllegalArgumentException("Invalid quantity for product: " + product.getName());
            }

            int prevQty = product.getStockQuantity();
            if (prevQty < reqQty) {
                throw new IllegalArgumentException("Insufficient stock for product '" + product.getName() 
                        + "'. Available: " + prevQty + ", Requested: " + reqQty);
            }

            // Deduct inventory
            int newQty = prevQty - reqQty;
            product.setStockQuantity(newQty);
            productRepository.save(product);

            // Stock log
            stockLogRepository.save(new StockAdjustmentLog(
                    product.getId(),
                    product.getName(),
                    retailerId,
                    -reqQty,
                    prevQty,
                    newQty,
                    AdjustmentType.SALE,
                    "Sold via Order " + order.getOrderNumber()
            ));

            BigDecimal unitSellingPrice = itemReq.getUnitSellingPrice() != null 
                    ? itemReq.getUnitSellingPrice() 
                    : product.getSellingPrice();

            BigDecimal unitCostPrice = product.getCostPrice();

            SaleOrderItem item = new SaleOrderItem(
                    product.getId(),
                    product.getName(),
                    product.getSku(),
                    unitCostPrice,
                    unitSellingPrice,
                    reqQty
            );

            order.addItem(item);

            subtotal = subtotal.add(item.getItemTotal());
            totalCost = totalCost.add(item.getItemCostTotal());
        }

        order.setSubtotal(subtotal);

        // Tax calculation
        BigDecimal taxRate = req.getTaxRate() != null ? req.getTaxRate() : BigDecimal.ZERO;
        order.setTaxRate(taxRate);
        BigDecimal taxAmount = subtotal.multiply(taxRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        order.setTaxAmount(taxAmount);

        // Discount calculation
        BigDecimal discount = req.getDiscountAmount() != null ? req.getDiscountAmount() : BigDecimal.ZERO;
        if (discount.compareTo(subtotal) > 0) {
            discount = subtotal;
        }
        order.setDiscountAmount(discount);

        // Total amount = subtotal + tax - discount
        BigDecimal totalAmount = subtotal.add(taxAmount).subtract(discount);
        order.setTotalAmount(totalAmount);
        order.setTotalCost(totalCost);

        // Net Revenue before tax = subtotal - discount
        BigDecimal netRevenueBeforeTax = subtotal.subtract(discount);
        BigDecimal totalProfit = netRevenueBeforeTax.subtract(totalCost);
        order.setTotalProfit(totalProfit);

        // Profit Margin % = (totalProfit / netRevenueBeforeTax) * 100
        BigDecimal marginPercent = BigDecimal.ZERO;
        if (netRevenueBeforeTax.compareTo(BigDecimal.ZERO) > 0) {
            marginPercent = totalProfit
                    .divide(netRevenueBeforeTax, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }
        order.setProfitMarginPercent(marginPercent);

        return saleOrderRepository.save(order);
    }

    public List<SaleOrder> getOrdersByRetailer(Long retailerId) {
        return saleOrderRepository.findByRetailerIdOrderByCreatedAtDesc(retailerId);
    }

    public SaleOrder getOrderById(Long orderId) {
        return saleOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));
    }

    public SaleOrder getOrderByNumber(String orderNumber) {
        return saleOrderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with number: " + orderNumber));
    }

    private String generateOrderNumber() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int rand = 1000 + new Random().nextInt(9000);
        return "INV-" + dateStr + "-" + rand;
    }
}
