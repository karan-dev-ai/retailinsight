package com.retailinsight.controller;

import com.retailinsight.dto.WholesaleDtos.*;
import com.retailinsight.model.PurchaseOrder;
import com.retailinsight.model.WholesaleListing;
import com.retailinsight.security.UserPrincipal;
import com.retailinsight.service.WholesaleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wholesale")
@Tag(name = "Wholesale & B2B Marketplace", description = "Connect shopkeepers with wholesalers for stock replenishment")
public class WholesaleController {

    private final WholesaleService wholesaleService;

    public WholesaleController(WholesaleService wholesaleService) {
        this.wholesaleService = wholesaleService;
    }

    @GetMapping("/listings")
    @Operation(summary = "Get all wholesale listings with optional search query")
    public ResponseEntity<List<WholesaleListing>> getListings(
            @RequestParam(value = "search", required = false) String search) {
        return ResponseEntity.ok(wholesaleService.searchListings(search));
    }

    @GetMapping("/my-listings")
    @Operation(summary = "Get listings owned by the authenticated wholesaler")
    public ResponseEntity<List<WholesaleListing>> getMyListings(@AuthenticationPrincipal UserPrincipal principal) {
        Long wholesalerId = resolveUserId(principal, 2L);
        return ResponseEntity.ok(wholesaleService.getWholesalerListings(wholesalerId));
    }

    @PostMapping("/listings")
    @Operation(summary = "Create a new wholesale product listing")
    public ResponseEntity<WholesaleListing> createListing(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody WholesaleListingRequest req) {
        Long wholesalerId = resolveUserId(principal, 2L);
        return ResponseEntity.ok(wholesaleService.createListing(wholesalerId, req));
    }

    @PutMapping("/listings/{id}")
    @Operation(summary = "Update wholesale listing")
    public ResponseEntity<WholesaleListing> updateListing(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody WholesaleListingRequest req) {
        Long wholesalerId = resolveUserId(principal, 2L);
        return ResponseEntity.ok(wholesaleService.updateListing(id, wholesalerId, req));
    }

    @DeleteMapping("/listings/{id}")
    @Operation(summary = "Delete wholesale listing")
    public ResponseEntity<Void> deleteListing(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long wholesalerId = resolveUserId(principal, 2L);
        wholesaleService.deleteListing(id, wholesalerId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/orders")
    @Operation(summary = "Retailer places a purchase restock order with a wholesaler")
    public ResponseEntity<PurchaseOrder> placePurchaseOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PurchaseOrderRequest req) {
        Long retailerId = resolveUserId(principal, 1L);
        return ResponseEntity.ok(wholesaleService.createPurchaseOrder(retailerId, req));
    }

    @GetMapping("/orders/retailer")
    @Operation(summary = "Retailer views their active restock purchase orders")
    public ResponseEntity<List<PurchaseOrder>> getRetailerOrders(@AuthenticationPrincipal UserPrincipal principal) {
        Long retailerId = resolveUserId(principal, 1L);
        return ResponseEntity.ok(wholesaleService.getOrdersByRetailer(retailerId));
    }

    @GetMapping("/orders/wholesaler")
    @Operation(summary = "Wholesaler views incoming orders from retailers")
    public ResponseEntity<List<PurchaseOrder>> getWholesalerOrders(@AuthenticationPrincipal UserPrincipal principal) {
        Long wholesalerId = resolveUserId(principal, 2L);
        return ResponseEntity.ok(wholesaleService.getOrdersByWholesaler(wholesalerId));
    }

    @PatchMapping("/orders/{id}/status")
    @Operation(summary = "Wholesaler updates order status (e.g. DELIVERED automatically restocks retailer product inventory)")
    public ResponseEntity<PurchaseOrder> updateOrderStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PurchaseOrderStatusUpdateRequest req) {
        Long userId = resolveUserId(principal, 2L);
        return ResponseEntity.ok(wholesaleService.updateOrderStatus(id, userId, req));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get wholesaler overview metrics")
    public ResponseEntity<WholesaleSummaryDto> getWholesaleSummary(@AuthenticationPrincipal UserPrincipal principal) {
        Long wholesalerId = resolveUserId(principal, 2L);
        return ResponseEntity.ok(wholesaleService.getWholesaleSummary(wholesalerId));
    }

    private Long resolveUserId(UserPrincipal principal, Long fallback) {
        if (principal != null) {
            return principal.getId();
        }
        return fallback;
    }
}
