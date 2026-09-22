package com.retailinsight.repository;

import com.retailinsight.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByRetailerId(Long retailerId);

    Optional<Product> findByBarcode(String barcode);

    Optional<Product> findByBarcodeAndRetailerId(String barcode, Long retailerId);

    Optional<Product> findBySku(String sku);

    Optional<Product> findBySkuAndRetailerId(String sku, Long retailerId);

    @Query("SELECT p FROM Product p WHERE p.retailerId = :retailerId AND p.stockQuantity <= p.minStockThreshold AND p.stockQuantity > 0")
    List<Product> findLowStockProducts(@Param("retailerId") Long retailerId);

    @Query("SELECT p FROM Product p WHERE p.retailerId = :retailerId AND (p.stockQuantity <= 0 OR p.stockQuantity IS NULL)")
    List<Product> findOutOfStockProducts(@Param("retailerId") Long retailerId);

    @Query("SELECT p FROM Product p WHERE p.retailerId = :retailerId AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.barcode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Product> searchProducts(@Param("retailerId") Long retailerId, @Param("query") String query);

    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.retailerId = :retailerId")
    List<String> findDistinctCategoriesByRetailerId(@Param("retailerId") Long retailerId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.retailerId = :retailerId AND p.stockQuantity <= p.minStockThreshold")
    long countLowStockProducts(@Param("retailerId") Long retailerId);
}
