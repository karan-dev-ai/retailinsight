package com.retailinsight.controller;

import com.retailinsight.dto.AnalyticsDtos.DashboardSummaryDto;
import com.retailinsight.dto.AnalyticsDtos.ProfitabilityMatrixDto;
import com.retailinsight.model.Product;
import com.retailinsight.model.SaleOrder;
import com.retailinsight.model.User;
import com.retailinsight.security.UserPrincipal;
import com.retailinsight.service.AuthService;
import com.retailinsight.service.PdfReportService;
import com.retailinsight.service.ProductService;
import com.retailinsight.service.ProfitabilityAnalyticsService;
import com.retailinsight.service.SalesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pdf")
@Tag(name = "PDF Reports & Invoices", description = "Generate and stream downloadable PDF invoices and P&L statements")
public class PdfController {

    private final PdfReportService pdfReportService;
    private final SalesService salesService;
    private final ProfitabilityAnalyticsService analyticsService;
    private final ProductService productService;
    private final AuthService authService;

    public PdfController(PdfReportService pdfReportService, SalesService salesService,
                         ProfitabilityAnalyticsService analyticsService, ProductService productService,
                         AuthService authService) {
        this.pdfReportService = pdfReportService;
        this.salesService = salesService;
        this.analyticsService = analyticsService;
        this.productService = productService;
        this.authService = authService;
    }

    @GetMapping("/invoice/{orderId}")
    @Operation(summary = "Download PDF invoice by order ID")
    public ResponseEntity<byte[]> getInvoicePdf(@PathVariable Long orderId) {
        SaleOrder order = salesService.getOrderById(orderId);
        byte[] pdfBytes = pdfReportService.generateInvoicePdf(order);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + order.getOrderNumber() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/invoice/number/{orderNumber}")
    @Operation(summary = "Download PDF invoice by order number")
    public ResponseEntity<byte[]> getInvoicePdfByNumber(@PathVariable String orderNumber) {
        SaleOrder order = salesService.getOrderByNumber(orderNumber);
        byte[] pdfBytes = pdfReportService.generateInvoicePdf(order);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + orderNumber + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/profit-loss-report")
    @Operation(summary = "Download Profit & Loss and Stock Audit PDF report")
    public ResponseEntity<byte[]> getProfitLossReport(@AuthenticationPrincipal UserPrincipal principal) {
        Long retailerId = (principal != null) ? principal.getId() : 1L;
        User user = authService.getCurrentUser(retailerId);
        DashboardSummaryDto summary = analyticsService.getDashboardSummary(retailerId);
        ProfitabilityMatrixDto matrix = analyticsService.getProfitabilityMatrix(retailerId);
        List<Product> products = productService.getAllProducts(retailerId);

        byte[] pdfBytes = pdfReportService.generateProfitLossReportPdf(user, summary, matrix, products);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"RetailInsight-ProfitLoss-Report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
