package com.retailinsight.controller;

import com.retailinsight.dto.SalesDtos.*;
import com.retailinsight.model.SaleOrder;
import com.retailinsight.security.UserPrincipal;
import com.retailinsight.service.SalesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@Tag(name = "Sales & POS Checkout", description = "POS transactions, billing, and sales invoices")
public class SalesController {

    private final SalesService salesService;

    public SalesController(SalesService salesService) {
        this.salesService = salesService;
    }

    @PostMapping("/checkout")
    @Operation(summary = "Execute POS checkout transaction (atomic inventory deduction and margin calculation)")
    public ResponseEntity<SaleOrder> checkout(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CheckoutRequest req) {
        Long retailerId = resolveRetailerId(principal);
        return ResponseEntity.ok(salesService.processCheckout(retailerId, req));
    }

    @GetMapping("/orders")
    @Operation(summary = "Get historical sales orders and invoices")
    public ResponseEntity<List<SaleOrder>> getOrders(@AuthenticationPrincipal UserPrincipal principal) {
        Long retailerId = resolveRetailerId(principal);
        return ResponseEntity.ok(salesService.getOrdersByRetailer(retailerId));
    }

    @GetMapping("/orders/{id}")
    @Operation(summary = "Get sales order by ID")
    public ResponseEntity<SaleOrder> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(salesService.getOrderById(id));
    }

    @GetMapping("/orders/number/{orderNumber}")
    @Operation(summary = "Get sales order by invoice order number")
    public ResponseEntity<SaleOrder> getOrderByNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(salesService.getOrderByNumber(orderNumber));
    }

    private Long resolveRetailerId(UserPrincipal principal) {
        if (principal != null) {
            return principal.getId();
        }
        return 1L; // Fallback demo retailer
    }
}
