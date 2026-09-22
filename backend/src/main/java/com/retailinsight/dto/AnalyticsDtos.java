package com.retailinsight.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AnalyticsDtos {

    public static class DashboardSummaryDto {
        private BigDecimal totalRevenue;
        private BigDecimal totalProfit;
        private BigDecimal profitMarginPercent;
        private long totalOrders;
        private long totalProducts;
        private long lowStockCount;
        private long outOfStockCount;

        private BigDecimal todayRevenue;
        private BigDecimal todayProfit;
        private long todayOrders;

        private BigDecimal weekRevenue;
        private BigDecimal weekProfit;

        private BigDecimal monthRevenue;
        private BigDecimal monthProfit;

        private BigDecimal tiedUpInventoryCapital;

        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
        public BigDecimal getTotalProfit() { return totalProfit; }
        public void setTotalProfit(BigDecimal totalProfit) { this.totalProfit = totalProfit; }
        public BigDecimal getProfitMarginPercent() { return profitMarginPercent; }
        public void setProfitMarginPercent(BigDecimal profitMarginPercent) { this.profitMarginPercent = profitMarginPercent; }
        public long getTotalOrders() { return totalOrders; }
        public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
        public long getTotalProducts() { return totalProducts; }
        public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }
        public long getLowStockCount() { return lowStockCount; }
        public void setLowStockCount(long lowStockCount) { this.lowStockCount = lowStockCount; }
        public long getOutOfStockCount() { return outOfStockCount; }
        public void setOutOfStockCount(long outOfStockCount) { this.outOfStockCount = outOfStockCount; }
        public BigDecimal getTodayRevenue() { return todayRevenue; }
        public void setTodayRevenue(BigDecimal todayRevenue) { this.todayRevenue = todayRevenue; }
        public BigDecimal getTodayProfit() { return todayProfit; }
        public void setTodayProfit(BigDecimal todayProfit) { this.todayProfit = todayProfit; }
        public long getTodayOrders() { return todayOrders; }
        public void setTodayOrders(long todayOrders) { this.todayOrders = todayOrders; }
        public BigDecimal getWeekRevenue() { return weekRevenue; }
        public void setWeekRevenue(BigDecimal weekRevenue) { this.weekRevenue = weekRevenue; }
        public BigDecimal getWeekProfit() { return weekProfit; }
        public void setWeekProfit(BigDecimal weekProfit) { this.weekProfit = weekProfit; }
        public BigDecimal getMonthRevenue() { return monthRevenue; }
        public void setMonthRevenue(BigDecimal monthRevenue) { this.monthRevenue = monthRevenue; }
        public BigDecimal getMonthProfit() { return monthProfit; }
        public void setMonthProfit(BigDecimal monthProfit) { this.monthProfit = monthProfit; }
        public BigDecimal getTiedUpInventoryCapital() { return tiedUpInventoryCapital; }
        public void setTiedUpInventoryCapital(BigDecimal tiedUpInventoryCapital) { this.tiedUpInventoryCapital = tiedUpInventoryCapital; }
    }

    public static class RevenueProfitTrendPoint {
        private String periodLabel; // e.g. "Aug 15", "Mon", "Week 32"
        private BigDecimal revenue;
        private BigDecimal cost;
        private BigDecimal profit;
        private long ordersCount;

        public RevenueProfitTrendPoint() {}

        public RevenueProfitTrendPoint(String periodLabel, BigDecimal revenue, BigDecimal cost, BigDecimal profit, long ordersCount) {
            this.periodLabel = periodLabel;
            this.revenue = revenue;
            this.cost = cost;
            this.profit = profit;
            this.ordersCount = ordersCount;
        }

        public String getPeriodLabel() { return periodLabel; }
        public void setPeriodLabel(String periodLabel) { this.periodLabel = periodLabel; }
        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
        public BigDecimal getCost() { return cost; }
        public void setCost(BigDecimal cost) { this.cost = cost; }
        public BigDecimal getProfit() { return profit; }
        public void setProfit(BigDecimal profit) { this.profit = profit; }
        public long getOrdersCount() { return ordersCount; }
        public void setOrdersCount(long ordersCount) { this.ordersCount = ordersCount; }
    }

    public static class CategoryPerformanceDto {
        private String category;
        private BigDecimal totalRevenue;
        private BigDecimal totalProfit;
        private long unitsSold;
        private BigDecimal marginPercent;
        private double revenueSharePercent;

        public CategoryPerformanceDto() {}

        public CategoryPerformanceDto(String category, BigDecimal totalRevenue, BigDecimal totalProfit, long unitsSold, BigDecimal marginPercent, double revenueSharePercent) {
            this.category = category;
            this.totalRevenue = totalRevenue;
            this.totalProfit = totalProfit;
            this.unitsSold = unitsSold;
            this.marginPercent = marginPercent;
            this.revenueSharePercent = revenueSharePercent;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
        public BigDecimal getTotalProfit() { return totalProfit; }
        public void setTotalProfit(BigDecimal totalProfit) { this.totalProfit = totalProfit; }
        public long getUnitsSold() { return unitsSold; }
        public void setUnitsSold(long unitsSold) { this.unitsSold = unitsSold; }
        public BigDecimal getMarginPercent() { return marginPercent; }
        public void setMarginPercent(BigDecimal marginPercent) { this.marginPercent = marginPercent; }
        public double getRevenueSharePercent() { return revenueSharePercent; }
        public void setRevenueSharePercent(double revenueSharePercent) { this.revenueSharePercent = revenueSharePercent; }
    }

    public static class ProductMatrixItemDto {
        private Long productId;
        private String productName;
        private String category;
        private long unitsSold;
        private BigDecimal totalRevenue;
        private BigDecimal totalProfit;
        private BigDecimal profitMarginPercent;
        private int stockQuantity;
        private String quadrant; // "STAR", "CASH_COW", "OPPORTUNITY", "UNDERPERFORMER"
        private String recommendation;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public long getUnitsSold() { return unitsSold; }
        public void setUnitsSold(long unitsSold) { this.unitsSold = unitsSold; }
        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
        public BigDecimal getTotalProfit() { return totalProfit; }
        public void setTotalProfit(BigDecimal totalProfit) { this.totalProfit = totalProfit; }
        public BigDecimal getProfitMarginPercent() { return profitMarginPercent; }
        public void setProfitMarginPercent(BigDecimal profitMarginPercent) { this.profitMarginPercent = profitMarginPercent; }
        public int getStockQuantity() { return stockQuantity; }
        public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }
        public String getQuadrant() { return quadrant; }
        public void setQuadrant(String quadrant) { this.quadrant = quadrant; }
        public String getRecommendation() { return recommendation; }
        public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    }

    public static class ProfitabilityMatrixDto {
        private List<ProductMatrixItemDto> stars; // High Vol, High Margin
        private List<ProductMatrixItemDto> cashCows; // High Vol, Low Margin
        private List<ProductMatrixItemDto> opportunities; // Low Vol, High Margin
        private List<ProductMatrixItemDto> underperformers; // Low Vol, Low Margin
        private List<ProductMatrixItemDto> allProducts;
        private String summaryInsights;

        public List<ProductMatrixItemDto> getStars() { return stars; }
        public void setStars(List<ProductMatrixItemDto> stars) { this.stars = stars; }
        public List<ProductMatrixItemDto> getCashCows() { return cashCows; }
        public void setCashCows(List<ProductMatrixItemDto> cashCows) { this.cashCows = cashCows; }
        public List<ProductMatrixItemDto> getOpportunities() { return opportunities; }
        public void setOpportunities(List<ProductMatrixItemDto> opportunities) { this.opportunities = opportunities; }
        public List<ProductMatrixItemDto> getUnderperformers() { return underperformers; }
        public void setUnderperformers(List<ProductMatrixItemDto> underperformers) { this.underperformers = underperformers; }
        public List<ProductMatrixItemDto> getAllProducts() { return allProducts; }
        public void setAllProducts(List<ProductMatrixItemDto> allProducts) { this.allProducts = allProducts; }
        public String getSummaryInsights() { return summaryInsights; }
        public void setSummaryInsights(String summaryInsights) { this.summaryInsights = summaryInsights; }
    }

    public static class DeadInventoryDto {
        private Long productId;
        private String productName;
        private String category;
        private Integer stockQuantity;
        private BigDecimal costPrice;
        private BigDecimal tiedUpCapital;
        private LocalDateTime lastSoldDate;
        private long daysInactive;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Integer getStockQuantity() { return stockQuantity; }
        public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
        public BigDecimal getCostPrice() { return costPrice; }
        public void setCostPrice(BigDecimal costPrice) { this.costPrice = costPrice; }
        public BigDecimal getTiedUpCapital() { return tiedUpCapital; }
        public void setTiedUpCapital(BigDecimal tiedUpCapital) { this.tiedUpCapital = tiedUpCapital; }
        public LocalDateTime getLastSoldDate() { return lastSoldDate; }
        public void setLastSoldDate(LocalDateTime lastSoldDate) { this.lastSoldDate = lastSoldDate; }
        public long getDaysInactive() { return daysInactive; }
        public void setDaysInactive(long daysInactive) { this.daysInactive = daysInactive; }
    }
}
