package com.retailinsight.service;

import com.retailinsight.dto.AnalyticsDtos.*;
import com.retailinsight.model.Product;
import com.retailinsight.model.SaleOrder;
import com.retailinsight.repository.ProductRepository;
import com.retailinsight.repository.SaleOrderItemRepository;
import com.retailinsight.repository.SaleOrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ProfitabilityAnalyticsService {

    private final SaleOrderRepository saleOrderRepository;
    private final SaleOrderItemRepository saleOrderItemRepository;
    private final ProductRepository productRepository;

    public ProfitabilityAnalyticsService(SaleOrderRepository saleOrderRepository,
                                         SaleOrderItemRepository saleOrderItemRepository,
                                         ProductRepository productRepository) {
        this.saleOrderRepository = saleOrderRepository;
        this.saleOrderItemRepository = saleOrderItemRepository;
        this.productRepository = productRepository;
    }

    public DashboardSummaryDto getDashboardSummary(Long retailerId) {
        DashboardSummaryDto dto = new DashboardSummaryDto();

        BigDecimal totalRevenue = saleOrderRepository.getTotalRevenueByRetailerId(retailerId);
        BigDecimal totalProfit = saleOrderRepository.getTotalProfitByRetailerId(retailerId);
        long totalOrders = saleOrderRepository.countByRetailerId(retailerId);

        dto.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        dto.setTotalProfit(totalProfit != null ? totalProfit : BigDecimal.ZERO);
        dto.setTotalOrders(totalOrders);

        BigDecimal margin = BigDecimal.ZERO;
        if (totalRevenue != null && totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            margin = totalProfit.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }
        dto.setProfitMarginPercent(margin);

        // Product counts
        List<Product> products = productRepository.findByRetailerId(retailerId);
        dto.setTotalProducts(products.size());
        dto.setLowStockCount(products.stream().filter(Product::isLowStock).count());
        dto.setOutOfStockCount(products.stream().filter(Product::isOutOfStock).count());

        // Capital tied up in stock
        BigDecimal tiedUp = products.stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() > 0 && p.getCostPrice() != null)
                .map(p -> p.getCostPrice().multiply(BigDecimal.valueOf(p.getStockQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTiedUpInventoryCapital(tiedUp);

        // Today's metrics
        LocalDateTime startOfToday = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        dto.setTodayRevenue(saleOrderRepository.getRevenueSince(retailerId, startOfToday));
        dto.setTodayProfit(saleOrderRepository.getProfitSince(retailerId, startOfToday));
        dto.setTodayOrders(saleOrderRepository.countOrdersSince(retailerId, startOfToday));

        // 7 days metrics
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        dto.setWeekRevenue(saleOrderRepository.getRevenueSince(retailerId, sevenDaysAgo));
        dto.setWeekProfit(saleOrderRepository.getProfitSince(retailerId, sevenDaysAgo));

        // 30 days metrics
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        dto.setMonthRevenue(saleOrderRepository.getRevenueSince(retailerId, thirtyDaysAgo));
        dto.setMonthProfit(saleOrderRepository.getProfitSince(retailerId, thirtyDaysAgo));

        return dto;
    }

    public List<RevenueProfitTrendPoint> getRevenueProfitTrends(Long retailerId, String range) {
        int days = 7;
        if ("30d".equalsIgnoreCase(range)) days = 30;
        else if ("90d".equalsIgnoreCase(range)) days = 90;
        else if ("14d".equalsIgnoreCase(range)) days = 14;

        LocalDateTime start = LocalDateTime.now().minusDays(days);
        List<SaleOrder> orders = saleOrderRepository.findByRetailerIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                retailerId, start, LocalDateTime.now());

        // Group by Date
        Map<LocalDate, List<SaleOrder>> byDate = new LinkedHashMap<>();
        for (int i = days - 1; i >= 0; i--) {
            byDate.put(LocalDate.now().minusDays(i), new ArrayList<>());
        }

        for (SaleOrder order : orders) {
            LocalDate date = order.getCreatedAt().toLocalDate();
            if (byDate.containsKey(date)) {
                byDate.get(date).add(order);
            }
        }

        DateTimeFormatter formatter = (days <= 14) 
                ? DateTimeFormatter.ofPattern("EEE (d MMM)") 
                : DateTimeFormatter.ofPattern("MMM d");

        List<RevenueProfitTrendPoint> points = new ArrayList<>();
        for (Map.Entry<LocalDate, List<SaleOrder>> entry : byDate.entrySet()) {
            LocalDate date = entry.getKey();
            List<SaleOrder> dayOrders = entry.getValue();

            BigDecimal rev = dayOrders.stream().map(SaleOrder::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal prof = dayOrders.stream().map(SaleOrder::getTotalProfit).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal cost = dayOrders.stream().map(SaleOrder::getTotalCost).reduce(BigDecimal.ZERO, BigDecimal::add);

            points.add(new RevenueProfitTrendPoint(
                    date.format(formatter),
                    rev,
                    cost,
                    prof,
                    dayOrders.size()
            ));
        }

        return points;
    }

    public List<CategoryPerformanceDto> getCategoryPerformance(Long retailerId) {
        List<Object[]> rawList = saleOrderItemRepository.findCategoryPerformance(retailerId);
        BigDecimal totalSalesAll = rawList.stream()
                .map(row -> (BigDecimal) row[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CategoryPerformanceDto> result = new ArrayList<>();
        for (Object[] row : rawList) {
            String category = (String) row[0];
            BigDecimal revenue = (BigDecimal) row[1];
            BigDecimal profit = (BigDecimal) row[2];
            long units = ((Number) row[3]).longValue();

            BigDecimal margin = BigDecimal.ZERO;
            if (revenue != null && revenue.compareTo(BigDecimal.ZERO) > 0) {
                margin = profit.divide(revenue, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP);
            }

            double share = 0.0;
            if (totalSalesAll.compareTo(BigDecimal.ZERO) > 0 && revenue != null) {
                share = revenue.divide(totalSalesAll, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
            }

            result.add(new CategoryPerformanceDto(category, revenue, profit, units, margin, share));
        }

        return result;
    }

    public ProfitabilityMatrixDto getProfitabilityMatrix(Long retailerId) {
        List<Product> products = productRepository.findByRetailerId(retailerId);
        List<Object[]> stats = saleOrderItemRepository.findProductPerformanceStats(retailerId);

        Map<Long, Object[]> statsMap = new HashMap<>();
        for (Object[] row : stats) {
            Long pId = (Long) row[0];
            statsMap.put(pId, row);
        }

        List<ProductMatrixItemDto> allItems = new ArrayList<>();
        long totalUnitsSold = 0;
        BigDecimal sumMargins = BigDecimal.ZERO;
        int countWithSales = 0;

        for (Product product : products) {
            ProductMatrixItemDto item = new ProductMatrixItemDto();
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setCategory(product.getCategory());
            item.setStockQuantity(product.getStockQuantity() != null ? product.getStockQuantity() : 0);

            BigDecimal margin = product.getMarginPercentage();
            item.setProfitMarginPercent(margin != null ? margin : BigDecimal.ZERO);

            if (statsMap.containsKey(product.getId())) {
                Object[] st = statsMap.get(product.getId());
                long units = ((Number) st[1]).longValue();
                BigDecimal rev = (BigDecimal) st[2];
                BigDecimal prof = (BigDecimal) st[3];

                item.setUnitsSold(units);
                item.setTotalRevenue(rev != null ? rev : BigDecimal.ZERO);
                item.setTotalProfit(prof != null ? prof : BigDecimal.ZERO);

                totalUnitsSold += units;
                sumMargins = sumMargins.add(item.getProfitMarginPercent());
                countWithSales++;
            } else {
                item.setUnitsSold(0);
                item.setTotalRevenue(BigDecimal.ZERO);
                item.setTotalProfit(BigDecimal.ZERO);
            }

            allItems.add(item);
        }

        // Calculate thresholds for quadrant classification
        double avgVolume = allItems.isEmpty() ? 5.0 : (double) totalUnitsSold / Math.max(1, allItems.size());
        double avgMargin = countWithSales == 0 ? 25.0 : sumMargins.divide(BigDecimal.valueOf(countWithSales), 2, RoundingMode.HALF_UP).doubleValue();

        List<ProductMatrixItemDto> stars = new ArrayList<>();
        List<ProductMatrixItemDto> cashCows = new ArrayList<>();
        List<ProductMatrixItemDto> opportunities = new ArrayList<>();
        List<ProductMatrixItemDto> underperformers = new ArrayList<>();

        for (ProductMatrixItemDto item : allItems) {
            boolean isHighVolume = item.getUnitsSold() >= avgVolume;
            boolean isHighMargin = item.getProfitMarginPercent().doubleValue() >= avgMargin;

            if (isHighVolume && isHighMargin) {
                item.setQuadrant("STAR");
                item.setRecommendation("★ Star Product: High Volume & High Margin. Ensure 100% stock availability and highlight in front display.");
                stars.add(item);
            } else if (isHighVolume && !isHighMargin) {
                item.setQuadrant("CASH_COW");
                item.setRecommendation("▲ Cash Cow: High Volume Driver. Negotiate bulk wholesale prices with suppliers or bundle with accessories to boost margin.");
                cashCows.add(item);
            } else if (!isHighVolume && isHighMargin) {
                item.setQuadrant("OPPORTUNITY");
                item.setRecommendation("◆ Opportunity: High Margin Gem. Run promotions, social posts, or feature in combo offers to drive traffic.");
                opportunities.add(item);
            } else {
                item.setQuadrant("UNDERPERFORMER");
                item.setRecommendation("▼ Underperformer: Low Volume & Low Margin. Consider clearance discount, bundle with stars, or phase out.");
                underperformers.add(item);
            }
        }

        ProfitabilityMatrixDto matrixDto = new ProfitabilityMatrixDto();
        matrixDto.setStars(stars);
        matrixDto.setCashCows(cashCows);
        matrixDto.setOpportunities(opportunities);
        matrixDto.setUnderperformers(underperformers);
        matrixDto.setAllProducts(allItems);

        matrixDto.setSummaryInsights(String.format(
                "Catalog analyzed: %d products. Identified %d Stars generating high profit velocity, %d Cash Cows powering sales volume, and %d Underperformers needing promotion or liquidation.",
                allItems.size(), stars.size(), cashCows.size(), underperformers.size()
        ));

        return matrixDto;
    }

    public List<DeadInventoryDto> getDeadInventory(Long retailerId, int daysInactiveThreshold) {
        LocalDateTime since = LocalDateTime.now().minusDays(daysInactiveThreshold);
        List<Long> activeProductIds = saleOrderItemRepository.findProductIdsSoldSince(retailerId, since);
        Set<Long> activeSet = new HashSet<>(activeProductIds);

        List<Product> products = productRepository.findByRetailerId(retailerId);
        List<DeadInventoryDto> deadList = new ArrayList<>();

        for (Product p : products) {
            if (p.getStockQuantity() != null && p.getStockQuantity() > 0 && !activeSet.contains(p.getId())) {
                DeadInventoryDto dto = new DeadInventoryDto();
                dto.setProductId(p.getId());
                dto.setProductName(p.getName());
                dto.setCategory(p.getCategory());
                dto.setStockQuantity(p.getStockQuantity());
                dto.setCostPrice(p.getCostPrice());

                BigDecimal tiedUp = p.getCostPrice().multiply(BigDecimal.valueOf(p.getStockQuantity()));
                dto.setTiedUpCapital(tiedUp);
                dto.setDaysInactive(daysInactiveThreshold);

                deadList.add(dto);
            }
        }

        deadList.sort((a, b) -> b.getTiedUpCapital().compareTo(a.getTiedUpCapital()));
        return deadList;
    }
}
