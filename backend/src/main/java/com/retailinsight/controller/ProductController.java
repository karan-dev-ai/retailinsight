package com.retailinsight.controller;

import com.retailinsight.dto.ProductDtos.*;
import com.retailinsight.model.Product;
import com.retailinsight.model.StockAdjustmentLog;
import com.retailinsight.security.UserPrincipal;
import com.retailinsight.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products & Inventory", description = "Product CRUD, live stock tracking, and barcode lookup")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "Get all products for the logged-in retailer (with optional search)")
    public ResponseEntity<List<Product>> getProducts(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(value = "search", required = false) String search) {
        Long retailerId = resolveRetailerId(principal);
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(productService.searchProducts(retailerId, search));
        }
        return ResponseEntity.ok(productService.getAllProducts(retailerId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/barcode/{barcode}")
    @Operation(summary = "Find product by scanned barcode or SKU")
    public ResponseEntity<Product> getProductByBarcode(
            @PathVariable String barcode,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long retailerId = resolveRetailerId(principal);
        return ResponseEntity.ok(productService.getProductByBarcode(barcode, retailerId));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get low stock products requiring replenishment")
    public ResponseEntity<List<Product>> getLowStockProducts(@AuthenticationPrincipal UserPrincipal principal) {
        Long retailerId = resolveRetailerId(principal);
        return ResponseEntity.ok(productService.getLowStockProducts(retailerId));
    }

    @GetMapping("/out-of-stock")
    @Operation(summary = "Get products currently with 0 inventory")
    public ResponseEntity<List<Product>> getOutOfStockProducts(@AuthenticationPrincipal UserPrincipal principal) {
        Long retailerId = resolveRetailerId(principal);
        return ResponseEntity.ok(productService.getOutOfStockProducts(retailerId));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get unique product categories")
    public ResponseEntity<List<String>> getCategories(@AuthenticationPrincipal UserPrincipal principal) {
        Long retailerId = resolveRetailerId(principal);
        return ResponseEntity.ok(productService.getCategories(retailerId));
    }

    @PostMapping
    @Operation(summary = "Create a new product")
    public ResponseEntity<Product> createProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProductRequest req) {
        Long retailerId = resolveRetailerId(principal);
        return ResponseEntity.ok(productService.createProduct(retailerId, req));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product details or inventory")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProductRequest req) {
        Long retailerId = resolveRetailerId(principal);
        return ResponseEntity.ok(productService.updateProduct(id, retailerId, req));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a product")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long retailerId = resolveRetailerId(principal);
        productService.deleteProduct(id, retailerId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/stock-adjust")
    @Operation(summary = "Adjust product inventory (restock, loss/damage, manual count)")
    public ResponseEntity<Product> adjustStock(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody StockAdjustmentRequest req) {
        Long retailerId = resolveRetailerId(principal);
        return ResponseEntity.ok(productService.adjustStock(retailerId, req));
    }

    @GetMapping("/{id}/logs")
    @Operation(summary = "Get stock adjustment audit history for a product")
    public ResponseEntity<List<StockAdjustmentLog>> getProductStockLogs(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long retailerId = resolveRetailerId(principal);
        return ResponseEntity.ok(productService.getStockLogs(id, retailerId));
    }

    @GetMapping("/logs")
    @Operation(summary = "Get all stock adjustment logs for retailer")
    public ResponseEntity<List<StockAdjustmentLog>> getAllStockLogs(@AuthenticationPrincipal UserPrincipal principal) {
        Long retailerId = resolveRetailerId(principal);
        return ResponseEntity.ok(productService.getAllStockLogsForRetailer(retailerId));
    }

    private Long resolveRetailerId(UserPrincipal principal) {
        if (principal != null) {
            return principal.getId();
        }
        return 1L; // Fallback demo retailer
    }
}
