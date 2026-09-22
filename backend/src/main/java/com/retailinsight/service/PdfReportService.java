package com.retailinsight.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.retailinsight.dto.AnalyticsDtos.DashboardSummaryDto;
import com.retailinsight.dto.AnalyticsDtos.ProductMatrixItemDto;
import com.retailinsight.dto.AnalyticsDtos.ProfitabilityMatrixDto;
import com.retailinsight.model.Product;
import com.retailinsight.model.SaleOrder;
import com.retailinsight.model.SaleOrderItem;
import com.retailinsight.model.User;
import com.retailinsight.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PdfReportService {

    private final UserRepository userRepository;
    private final BarcodeService barcodeService;

    public PdfReportService(UserRepository userRepository, BarcodeService barcodeService) {
        this.userRepository = userRepository;
        this.barcodeService = barcodeService;
    }

    public byte[] generateInvoicePdf(SaleOrder order) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Store Info
            User retailer = userRepository.findById(order.getRetailerId()).orElse(null);
            String storeName = (retailer != null && retailer.getBusinessName() != null) ? retailer.getBusinessName() : "RetailInsight Store";
            String storeAddress = (retailer != null && retailer.getAddress() != null) ? retailer.getAddress() : "Retail Merchant Location";
            String storePhone = (retailer != null && retailer.getPhone() != null) ? retailer.getPhone() : "+91-9876543210";
            String storeGst = (retailer != null && retailer.getGstOrTaxId() != null) ? "GSTIN: " + retailer.getGstOrTaxId() : "";

            // Header Title
            Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, new Color(30, 41, 59));
            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);

            Paragraph title = new Paragraph("TAX INVOICE / CASH RECEIPT", brandFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph storeInfo = new Paragraph(storeName + "\n" + storeAddress + " | Phone: " + storePhone + (storeGst.isEmpty() ? "" : " | " + storeGst), subFont);
            storeInfo.setAlignment(Element.ALIGN_CENTER);
            storeInfo.setSpacingAfter(15);
            document.add(storeInfo);

            // Invoice details banner table
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingAfter(15);

            PdfPCell c1 = new PdfPCell();
            c1.setBorder(Rectangle.NO_BORDER);
            c1.addElement(new Paragraph("Invoice No: " + order.getOrderNumber(), boldFont));
            c1.addElement(new Paragraph("Date: " + order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy hh:mm a")), normalFont));
            c1.addElement(new Paragraph("Payment Method: " + order.getPaymentMethod(), normalFont));

            PdfPCell c2 = new PdfPCell();
            c2.setBorder(Rectangle.NO_BORDER);
            c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            c2.addElement(new Paragraph("Customer: " + order.getCustomerName(), boldFont));
            if (order.getCustomerPhone() != null && !order.getCustomerPhone().isEmpty()) {
                c2.addElement(new Paragraph("Phone: " + order.getCustomerPhone(), normalFont));
            }

            metaTable.addCell(c1);
            metaTable.addCell(c2);
            document.add(metaTable);

            // Items Table
            PdfPTable table = new PdfPTable(new float[]{1f, 4f, 2f, 2f, 2f});
            table.setWidthPercentage(100);
            table.setHeaderRows(1);

            String[] headers = {"#", "Item Description", "Qty", "Unit Price", "Total (₹)"};
            for (String h : headers) {
                PdfPCell headerCell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE)));
                headerCell.setBackgroundColor(new Color(30, 41, 59));
                headerCell.setPadding(6);
                headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(headerCell);
            }

            int idx = 1;
            for (SaleOrderItem item : order.getItems()) {
                PdfPCell cellIdx = new PdfPCell(new Phrase(String.valueOf(idx++), normalFont));
                cellIdx.setHorizontalAlignment(Element.ALIGN_CENTER);
                cellIdx.setPadding(5);

                PdfPCell cellName = new PdfPCell(new Phrase(item.getProductName(), normalFont));
                cellName.setPadding(5);

                PdfPCell cellQty = new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), normalFont));
                cellQty.setHorizontalAlignment(Element.ALIGN_CENTER);
                cellQty.setPadding(5);

                PdfPCell cellPrice = new PdfPCell(new Phrase("₹" + item.getUnitSellingPrice().toString(), normalFont));
                cellPrice.setHorizontalAlignment(Element.ALIGN_RIGHT);
                cellPrice.setPadding(5);

                PdfPCell cellTotal = new PdfPCell(new Phrase("₹" + item.getItemTotal().toString(), boldFont));
                cellTotal.setHorizontalAlignment(Element.ALIGN_RIGHT);
                cellTotal.setPadding(5);

                table.addCell(cellIdx);
                table.addCell(cellName);
                table.addCell(cellQty);
                table.addCell(cellPrice);
                table.addCell(cellTotal);
            }
            document.add(table);

            // Totals Table
            PdfPTable totalsTable = new PdfPTable(new float[]{3f, 2f});
            totalsTable.setWidthPercentage(50);
            totalsTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalsTable.setSpacingBefore(10);

            addTotalRow(totalsTable, "Subtotal:", "₹" + order.getSubtotal().toString(), normalFont);
            if (order.getTaxAmount().compareTo(BigDecimal.ZERO) > 0) {
                addTotalRow(totalsTable, "GST / Tax (" + order.getTaxRate() + "%):", "₹" + order.getTaxAmount().toString(), normalFont);
            }
            if (order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                addTotalRow(totalsTable, "Discount:", "-₹" + order.getDiscountAmount().toString(), normalFont);
            }
            addTotalRow(totalsTable, "GRAND TOTAL:", "₹" + order.getTotalAmount().toString(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(16, 185, 129)));

            document.add(totalsTable);

            // Barcode image at the bottom
            try {
                byte[] barcodeBytes = barcodeService.generateBarcodePngBytes(order.getOrderNumber(), "CODE_128", 220, 50);
                Image barcodeImg = Image.getInstance(barcodeBytes);
                barcodeImg.setAlignment(Element.ALIGN_CENTER);
                barcodeImg.setSpacingBefore(15);
                document.add(barcodeImg);
            } catch (Exception ignored) {}

            Paragraph footer = new Paragraph("Thank you for shopping with us!\nGenerated by RetailInsight SaaS", subFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(10);
            document.add(footer);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF invoice", e);
        }

        return out.toByteArray();
    }

    public byte[] generateProfitLossReportPdf(User retailer, DashboardSummaryDto summary, ProfitabilityMatrixDto matrix, List<Product> products) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(15, 23, 42));
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(30, 58, 138));
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.DARK_GRAY);

            Paragraph title = new Paragraph("RETAILINSIGHT - PROFIT & LOSS AUDIT REPORT", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            String bizName = retailer != null && retailer.getBusinessName() != null ? retailer.getBusinessName() : "Retail Store";
            Paragraph sub = new Paragraph("Merchant: " + bizName + " | Generated on: " + java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm")), normalFont);
            sub.setAlignment(Element.ALIGN_CENTER);
            sub.setSpacingAfter(15);
            document.add(sub);

            // KPI Summary Grid
            PdfPTable kpiTable = new PdfPTable(4);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingAfter(15);

            addKpiCell(kpiTable, "Total Sales Revenue", "₹" + summary.getTotalRevenue(), new Color(240, 249, 255));
            addKpiCell(kpiTable, "Total Net Profit", "₹" + summary.getTotalProfit(), new Color(236, 253, 245));
            addKpiCell(kpiTable, "Gross Profit Margin", summary.getProfitMarginPercent() + "%", new Color(254, 243, 199));
            addKpiCell(kpiTable, "Tied-Up Capital", "₹" + summary.getTiedUpInventoryCapital(), new Color(254, 242, 242));
            document.add(kpiTable);

            // BCG Product Profitability Matrix Breakdown
            Paragraph matrixTitle = new Paragraph("Product Profitability Matrix (BCG Classification)", sectionFont);
            matrixTitle.setSpacingAfter(8);
            document.add(matrixTitle);

            PdfPTable matrixTable = new PdfPTable(new float[]{3f, 2f, 1.5f, 1.5f, 1.5f, 2f});
            matrixTable.setWidthPercentage(100);
            matrixTable.setHeaderRows(1);

            String[] mHeaders = {"Product Name", "Category", "Units Sold", "Margin %", "Stock", "Classification"};
            for (String h : mHeaders) {
                PdfPCell c = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE)));
                c.setBackgroundColor(new Color(51, 65, 85));
                c.setPadding(5);
                matrixTable.addCell(c);
            }

            for (ProductMatrixItemDto item : matrix.getAllProducts()) {
                matrixTable.addCell(new Phrase(item.getProductName(), normalFont));
                matrixTable.addCell(new Phrase(item.getCategory(), normalFont));
                matrixTable.addCell(new Phrase(String.valueOf(item.getUnitsSold()), normalFont));
                matrixTable.addCell(new Phrase(item.getProfitMarginPercent() + "%", normalFont));
                matrixTable.addCell(new Phrase(String.valueOf(item.getStockQuantity()), normalFont));
                matrixTable.addCell(new Phrase(item.getQuadrant(), boldFont));
            }
            document.add(matrixTable);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Profit Loss Report", e);
        }

        return out.toByteArray();
    }

    private void addTotalRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell cLabel = new PdfPCell(new Phrase(label, font));
        cLabel.setBorder(Rectangle.NO_BORDER);
        cLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cLabel.setPadding(3);

        PdfPCell cVal = new PdfPCell(new Phrase(value, font));
        cVal.setBorder(Rectangle.NO_BORDER);
        cVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cVal.setPadding(3);

        table.addCell(cLabel);
        table.addCell(cVal);
    }

    private void addKpiCell(PdfPTable table, String title, String value, Color bgColor) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(bgColor);
        cell.setPadding(8);
        cell.addElement(new Paragraph(title, FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY)));
        cell.addElement(new Paragraph(value, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK)));
        table.addCell(cell);
    }
}
