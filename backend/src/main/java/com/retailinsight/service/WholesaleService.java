package com.retailinsight.service;

import com.retailinsight.dto.WholesaleDtos.*;
import com.retailinsight.model.*;
import com.retailinsight.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
public class WholesaleService {

    private final WholesaleListingRepository listingRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final StockAdjustmentLogRepository stockLogRepository;

    public WholesaleService(WholesaleListingRepository listingRepository,
                            PurchaseOrderRepository purchaseOrderRepository,
                            UserRepository userRepository,
                            ProductRepository productRepository,
                            StockAdjustmentLogRepository stockLogRepository) {
        this.listingRepository = listingRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.stockLogRepository = stockLogRepository;
    }

    public List<WholesaleListing> getAllListings() {
        return listingRepository.findAll();
    }

    public List<WholesaleListing> getWholesalerListings(Long wholesalerId) {
        return listingRepository.findByWholesalerId(wholesalerId);
    }

    public List<WholesaleListing> searchListings(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllListings();
        }
        return listingRepository.searchListings(query.trim());
    }

    @Transactional
    public WholesaleListing createListing(Long wholesalerId, WholesaleListingRequest req) {
        User wholesaler = userRepository.findById(wholesalerId)
                .orElseThrow(() -> new IllegalArgumentException("Wholesaler user not found"));

        String wholesalerName = wholesaler.getBusinessName() != null && !wholesaler.getBusinessName().isEmpty()
                ? wholesaler.getBusinessName() : wholesaler.getFullName();

        WholesaleListing listing = new WholesaleListing(
                wholesalerId,
                wholesalerName,
                req.getTitle(),
                req.getDescription(),
                req.getCategory(),
                req.getUnit(),
                req.getUnitPrice(),
                req.getMinOrderQuantity() != null ? req.getMinOrderQuantity() : 1,
                req.getStockAvailable() != null ? req.getStockAvailable() : 100,
                req.getBulkDiscountPercent(),
                req.getBulkDiscountThreshold(),
                req.getImageUrl()
        );

        return listingRepository.save(listing);
    }

    @Transactional
    public WholesaleListing updateListing(Long listingId, Long wholesalerId, WholesaleListingRequest req) {
        WholesaleListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found with ID: " + listingId));

        if (!listing.getWholesalerId().equals(wholesalerId)) {
            throw new IllegalArgumentException("Unauthorized to edit this listing");
        }

        listing.setTitle(req.getTitle());
        listing.setDescription(req.getDescription());
        listing.setCategory(req.getCategory());
        listing.setUnit(req.getUnit());
        listing.setUnitPrice(req.getUnitPrice());
        listing.setMinOrderQuantity(req.getMinOrderQuantity());
        listing.setStockAvailable(req.getStockAvailable());
        listing.setBulkDiscountPercent(req.getBulkDiscountPercent());
        listing.setBulkDiscountThreshold(req.getBulkDiscountThreshold());
        listing.setImageUrl(req.getImageUrl());

        return listingRepository.save(listing);
    }

    @Transactional
    public void deleteListing(Long listingId, Long wholesalerId) {
        WholesaleListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found with ID: " + listingId));

        if (!listing.getWholesalerId().equals(wholesalerId)) {
            throw new IllegalArgumentException("Unauthorized to delete this listing");
        }

        listingRepository.delete(listing);
    }

    @Transactional
    public PurchaseOrder createPurchaseOrder(Long retailerId, PurchaseOrderRequest req) {
        WholesaleListing listing = listingRepository.findById(req.getListingId())
                .orElseThrow(() -> new IllegalArgumentException("Wholesale listing not found with ID: " + req.getListingId()));

        User retailer = userRepository.findById(retailerId)
                .orElseThrow(() -> new IllegalArgumentException("Retailer user not found"));

        int qty = req.getQuantity();
        if (qty < listing.getMinOrderQuantity()) {
            throw new IllegalArgumentException("Quantity cannot be less than Minimum Order Quantity (MOQ): " + listing.getMinOrderQuantity());
        }

        if (qty > listing.getStockAvailable()) {
            throw new IllegalArgumentException("Requested quantity exceeds available supplier stock: " + listing.getStockAvailable());
        }

        // Apply bulk discount if applicable
        BigDecimal unitPrice = listing.getUnitPrice();
        if (listing.getBulkDiscountThreshold() != null && listing.getBulkDiscountPercent() != null 
                && qty >= listing.getBulkDiscountThreshold()) {
            BigDecimal discountMultiplier = BigDecimal.ONE.subtract(
                    listing.getBulkDiscountPercent().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
            unitPrice = unitPrice.multiply(discountMultiplier).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal totalAmount = unitPrice.multiply(BigDecimal.valueOf(qty));

        // Deduct wholesaler stock
        listing.setStockAvailable(listing.getStockAvailable() - qty);
        listingRepository.save(listing);

        PurchaseOrder po = new PurchaseOrder();
        po.setOrderNumber(generatePoNumber());
        po.setRetailerId(retailerId);
        po.setRetailerName(retailer.getFullName());
        po.setRetailerBusinessName(retailer.getBusinessName());
        po.setRetailerPhone(retailer.getPhone());
        po.setWholesalerId(listing.getWholesalerId());
        po.setWholesalerName(listing.getWholesalerName());
        po.setListingId(listing.getId());
        po.setProductName(listing.getTitle());
        po.setWholesaleUnit(listing.getUnit());
        po.setQuantity(qty);
        po.setUnitPrice(unitPrice);
        po.setTotalAmount(totalAmount);
        po.setStatus(OrderStatus.PENDING);
        po.setNotes(req.getNotes());
        po.setRetailerProductId(req.getRetailerProductId());
        po.setUnitsPerWholesalePack(req.getUnitsPerWholesalePack() != null ? req.getUnitsPerWholesalePack() : 1);

        return purchaseOrderRepository.save(po);
    }

    @Transactional
    public PurchaseOrder updateOrderStatus(Long orderId, Long userId, PurchaseOrderStatusUpdateRequest req) {
        PurchaseOrder po = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Purchase order not found with ID: " + orderId));

        OrderStatus previousStatus = po.getStatus();
        OrderStatus newStatus = req.getStatus();

        po.setStatus(newStatus);
        if (req.getTrackingNumber() != null) {
            po.setTrackingNumber(req.getTrackingNumber());
        }
        if (req.getNotes() != null) {
            po.setNotes(req.getNotes());
        }

        // AUTO-RESTOCK INTO RETAILER INVENTORY WHEN DELIVERED
        if (newStatus == OrderStatus.DELIVERED && previousStatus != OrderStatus.DELIVERED) {
            if (po.getRetailerProductId() != null) {
                productRepository.findById(po.getRetailerProductId()).ifPresent(prod -> {
                    int unitsToAdd = po.getQuantity() * (po.getUnitsPerWholesalePack() != null ? po.getUnitsPerWholesalePack() : 1);
                    int prevStock = prod.getStockQuantity() != null ? prod.getStockQuantity() : 0;
                    int newStock = prevStock + unitsToAdd;
                    prod.setStockQuantity(newStock);
                    productRepository.save(prod);

                    stockLogRepository.save(new StockAdjustmentLog(
                            prod.getId(),
                            prod.getName(),
                            po.getRetailerId(),
                            unitsToAdd,
                            prevStock,
                            newStock,
                            AdjustmentType.WHOLESALE_PURCHASE,
                            "Restocked via Wholesaler PO #" + po.getOrderNumber() + " (" + po.getWholesalerName() + ")"
                    ));
                });
            }
        }

        return purchaseOrderRepository.save(po);
    }

    public List<PurchaseOrder> getOrdersByRetailer(Long retailerId) {
        return purchaseOrderRepository.findByRetailerIdOrderByCreatedAtDesc(retailerId);
    }

    public List<PurchaseOrder> getOrdersByWholesaler(Long wholesalerId) {
        return purchaseOrderRepository.findByWholesalerIdOrderByCreatedAtDesc(wholesalerId);
    }

    public WholesaleSummaryDto getWholesaleSummary(Long wholesalerId) {
        WholesaleSummaryDto dto = new WholesaleSummaryDto();
        dto.setTotalListings(listingRepository.findByWholesalerId(wholesalerId).size());
        dto.setPendingOrders(purchaseOrderRepository.countByWholesalerIdAndStatus(wholesalerId, OrderStatus.PENDING));
        dto.setConfirmedOrders(purchaseOrderRepository.countByWholesalerIdAndStatus(wholesalerId, OrderStatus.CONFIRMED));
        dto.setDeliveredOrders(purchaseOrderRepository.countByWholesalerIdAndStatus(wholesalerId, OrderStatus.DELIVERED));
        dto.setTotalWholesaleRevenue(purchaseOrderRepository.getTotalWholesalerRevenue(wholesalerId));
        return dto;
    }

    private String generatePoNumber() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int rand = 1000 + new Random().nextInt(9000);
        return "PO-" + dateStr + "-" + rand;
    }
}
