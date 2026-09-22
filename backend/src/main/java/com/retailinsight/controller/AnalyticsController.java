package com.retailinsight.controller;

import com.retailinsight.dto.AnalyticsDtos.*;
import com.retailinsight.security.UserPrincipal;
import com.retailinsight.service.ProfitabilityAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Profitability & Analytics", description = "Profit calculations, BCG quadrant matrices, revenue trends, and dead inventory")
public class AnalyticsController {

    private final ProfitabilityAnalyticsService analyticsService;

    public AnalyticsController(ProfitabilityAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get high-level business KPI metrics and capital stats")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary(@AuthenticationPrincipal UserPrincipal principal) {
        Long retailerId = resolveRetailerId(principal);
        return ResponseEntity.ok(analyticsService.getDashboardSummary(retailerId));
    }

    @GetMapping("/trends")
    @Operation(summary = "Get historical revenue, cost, and profit time series data")
    public ResponseEntity<List<RevenueProfitTrendPoint>> getTrends(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(value = "range", defaultValue = "7d") String range) {
        Long retailerId = resolveRetailerId(principal);
        return ResponseEntity.ok(analyticsService.getRevenueProfitTrends(retailerId, range));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get sales, profit, and volume breakdown by product category")
    public ResponseEntity<List<CategoryPerformanceDto>> getCategoryPerformance(@AuthenticationPrincipal UserPrincipal principal) {
        Long retailerId = resolveRetailerId(principal);
        return ResponseEntity.ok(analyticsService.getCategoryPerformance(retailerId));
    }

    @GetMapping("/profitability-matrix")
    @Operation(summary = "Get BCG Product Profitability Matrix (Stars, Cash Cows, Opportunities, Underperformers)")
    public ResponseEntity<ProfitabilityMatrixDto> getProfitabilityMatrix(@AuthenticationPrincipal UserPrincipal principal) {
        Long retailerId = resolveRetailerId(principal);
        return ResponseEntity.ok(analyticsService.getProfitabilityMatrix(retailerId));
    }

    @GetMapping("/dead-inventory")
    @Operation(summary = "Get slow-moving/dead inventory with trapped capital")
    public ResponseEntity<List<DeadInventoryDto>> getDeadInventory(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(value = "days", defaultValue = "30") int days) {
        Long retailerId = resolveRetailerId(principal);
        return ResponseEntity.ok(analyticsService.getDeadInventory(retailerId, days));
    }

    private Long resolveRetailerId(UserPrincipal principal) {
        if (principal != null) {
            return principal.getId();
        }
        return 1L; // Fallback demo retailer
    }
}
