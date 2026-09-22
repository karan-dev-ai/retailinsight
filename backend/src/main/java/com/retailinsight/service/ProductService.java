package com.retailinsight.service;

import com.retailinsight.dto.ProductDtos.*;
import com.retailinsight.model.AdjustmentType;
import com.retailinsight.model.Product;
import com.retailinsight.model.StockAdjustmentLog;
import com.retailinsight.repository.ProductRepository;
import com.retailinsight.repository.StockAdjustmentLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final StockAdjustmentLogRepository stockLogRepository;

    public ProductService(ProductRepository productRepository, StockAdjustmentLogRepository stockLogRepository) {
        this.productRepository = productRepository;
        this.stockLogRepository = stockLogRepository;
    }

    public List<Product> getAllProducts(Long retailerId) {
        return productRepository.findByRetailerId(retailerId);
    }

    public Product getProductById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));
    }

    public Product getProductByBarcode(String barcode, Long retailerId) {
        return productRepository.findByBarcodeAndRetailerId(barcode, retailerId)
                .or(() -> productRepository.findByBarcode(barcode))
                .orElseThrow(() -> new IllegalArgumentException("No product found with barcode: " + barcode));
    }

    public List<Product> getLowStockProducts(Long retailerId) {
        return productRepository.findLowStockProducts(retailerId);
    }

    public List<Product> getOutOfStockProducts(Long retailerId) {
        return productRepository.findOutOfStockProducts(retailerId);
    }

    public List<Product> searchProducts(Long retailerId, String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllProducts(retailerId);
        }
        return productRepository.searchProducts(retailerId, query.trim());
    }

    public List<String> getCategories(Long retailerId) {
        return productRepository.findDistinctCategoriesByRetailerId(retailerId);
    }

    @Transactional
    public Product createProduct(Long retailerId, ProductRequest req) {
        String sku = req.getSku();
        if (sku == null || sku.trim().isEmpty()) {
            sku = generateUniqueSku(req.getCategory());
        }

        String barcode = req.getBarcode();
        if (barcode == null || barcode.trim().isEmpty()) {
            barcode = generateEan13Barcode();
        }

        Product product = new Product(
                req.getName(),
                sku,
                barcode,
                req.getCategory(),
                req.getCostPrice(),
                req.getSellingPrice(),
                req.getStockQuantity() != null ? req.getStockQuantity() : 0,
                req.getMinStockThreshold() != null ? req.getMinStockThreshold() : 5,
                req.getUnit() != null ? req.getUnit() : "pcs",
                req.getDescription(),
                req.getImageUrl(),
                retailerId
        );

        Product saved = productRepository.save(product);

        // Record initial stock log
        if (saved.getStockQuantity() > 0) {
            stockLogRepository.save(new StockAdjustmentLog(
                    saved.getId(),
                    saved.getName(),
                    retailerId,
                    saved.getStockQuantity(),
                    0,
                    saved.getStockQuantity(),
                    AdjustmentType.RESTOCK,
                    "Initial stock creation"
            ));
        }

        return saved;
    }

    @Transactional
    public Product updateProduct(Long productId, Long retailerId, ProductRequest req) {
        Product product = getProductById(productId);

        if (!product.getRetailerId().equals(retailerId)) {
            throw new IllegalArgumentException("Unauthorized to modify this product");
        }

        int previousQty = product.getStockQuantity();

        product.setName(req.getName());
        product.setCategory(req.getCategory());
        product.setCostPrice(req.getCostPrice());
        product.setSellingPrice(req.getSellingPrice());
        product.setMinStockThreshold(req.getMinStockThreshold());
        product.setUnit(req.getUnit() != null ? req.getUnit() : product.getUnit());
        product.setDescription(req.getDescription());
        product.setImageUrl(req.getImageUrl());

        if (req.getBarcode() != null && !req.getBarcode().trim().isEmpty()) {
            product.setBarcode(req.getBarcode().trim());
        }

        if (req.getStockQuantity() != null && req.getStockQuantity() != previousQty) {
            int diff = req.getStockQuantity() - previousQty;
            product.setStockQuantity(req.getStockQuantity());
            stockLogRepository.save(new StockAdjustmentLog(
                    product.getId(),
                    product.getName(),
                    retailerId,
                    diff,
                    previousQty,
                    req.getStockQuantity(),
                    diff > 0 ? AdjustmentType.RESTOCK : AdjustmentType.ADJUSTMENT,
                    "Manual stock quantity update"
            ));
        }

        return productRepository.save(product);
    }

    @Transactional
    public Product adjustStock(Long retailerId, StockAdjustmentRequest req) {
        Product product = getProductById(req.getProductId());

        if (!product.getRetailerId().equals(retailerId)) {
            throw new IllegalArgumentException("Unauthorized to modify this product");
        }

        int previousQty = product.getStockQuantity();
        int newQty = previousQty + req.getChangeQty();

        if (newQty < 0) {
            throw new IllegalArgumentException("Cannot reduce stock below 0. Current stock: " + previousQty);
        }

        product.setStockQuantity(newQty);
        Product saved = productRepository.save(product);

        stockLogRepository.save(new StockAdjustmentLog(
                product.getId(),
                product.getName(),
                retailerId,
                req.getChangeQty(),
                previousQty,
                newQty,
                req.getType() != null ? req.getType() : AdjustmentType.ADJUSTMENT,
                req.getReason() != null ? req.getReason() : "Stock adjustment"
        ));

        return saved;
    }

    @Transactional
    public void deleteProduct(Long productId, Long retailerId) {
        Product product = getProductById(productId);
        if (!product.getRetailerId().equals(retailerId)) {
            throw new IllegalArgumentException("Unauthorized to delete this product");
        }
        productRepository.delete(product);
    }

    public List<StockAdjustmentLog> getStockLogs(Long productId, Long retailerId) {
        return stockLogRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    public List<StockAdjustmentLog> getAllStockLogsForRetailer(Long retailerId) {
        return stockLogRepository.findByRetailerIdOrderByCreatedAtDesc(retailerId);
    }

    private String generateUniqueSku(String category) {
        String prefix = (category != null && category.length() >= 3)
                ? category.substring(0, 3).toUpperCase()
                : "PRD";
        return prefix + "-" + (1000 + new Random().nextInt(9000));
    }

    private String generateEan13Barcode() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder("890"); // India / Global EAN prefix
        for (int i = 0; i < 9; i++) {
            sb.append(random.nextInt(10));
        }
        // Calculate check digit
        int sum = 0;
        for (int i = 0; i < 12; i++) {
            int digit = Character.getNumericValue(sb.charAt(i));
            sum += (i % 2 == 0) ? digit : digit * 3;
        }
        int checkDigit = (10 - (sum % 10)) % 10;
        sb.append(checkDigit);
        return sb.toString();
    }
}
