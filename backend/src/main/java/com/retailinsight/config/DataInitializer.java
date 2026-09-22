package com.retailinsight.config;

import com.retailinsight.dto.SalesDtos.CheckoutItemRequest;
import com.retailinsight.dto.SalesDtos.CheckoutRequest;
import com.retailinsight.model.*;
import com.retailinsight.repository.*;
import com.retailinsight.service.SalesService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final WholesaleListingRepository wholesaleListingRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SaleOrderRepository saleOrderRepository;
    private final PasswordEncoder passwordEncoder;
    private final SalesService salesService;

    public DataInitializer(UserRepository userRepository, ProductRepository productRepository,
                           WholesaleListingRepository wholesaleListingRepository,
                           PurchaseOrderRepository purchaseOrderRepository,
                           SaleOrderRepository saleOrderRepository,
                           PasswordEncoder passwordEncoder,
                           SalesService salesService) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.wholesaleListingRepository = wholesaleListingRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.saleOrderRepository = saleOrderRepository;
        this.passwordEncoder = passwordEncoder;
        this.salesService = salesService;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            logger.info("Database already initialized.");
            return;
        }

        logger.info("Initializing RetailInsight realistic sample data...");

        // 1. Seed Users
        User retailer = new User(
                "retailer",
                "retailer@retailinsight.com",
                passwordEncoder.encode("password123"),
                "Karan Sharma",
                "+91-9876543210",
                "Karan General & Daily Mart",
                "27ABCDE1234F1Z5",
                "Shop #12, Market Avenue, Sector 4",
                Role.ROLE_RETAILER
        );
        userRepository.save(retailer);

        User wholesaler = new User(
                "wholesaler",
                "wholesaler@retailinsight.com",
                passwordEncoder.encode("password123"),
                "Apex Mega Distributors",
                "+91-9822334455",
                "Apex FMCG & Agro Wholesale Hub",
                "27XYZWE9876Q2A1",
                "Warehouse 4B, Industrial Logistics Park",
                Role.ROLE_WHOLESALER
        );
        userRepository.save(wholesaler);

        User admin = new User(
                "admin",
                "admin@retailinsight.com",
                passwordEncoder.encode("password123"),
                "Platform Admin",
                "+91-9900112233",
                "RetailInsight Central",
                "27ADMIN0000A1Z9",
                "HQ Cloud Tower",
                Role.ROLE_ADMIN
        );
        userRepository.save(admin);

        // 2. Seed Retailer Products
        List<Product> products = new ArrayList<>();

        // High margin stars
        products.add(new Product("Tata Tea Premium 500g", "TEA-001", "8901052001015", "Beverages",
                new BigDecimal("210.00"), new BigDecimal("275.00"), 45, 10, "pack",
                "Desh ki Chai rich taste tea", "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300", retailer.getId()));

        products.add(new Product("Fortune Sunlite Refined Sunflower Oil 1L", "OIL-002", "8906007281023", "Groceries",
                new BigDecimal("128.00"), new BigDecimal("155.00"), 32, 8, "pouch",
                "Healthy edible cooking oil with vitamins", "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300", retailer.getId()));

        products.add(new Product("Maggi 2-Minute Instant Noodles 280g", "MAG-003", "8901058852307", "Snacks",
                new BigDecimal("42.00"), new BigDecimal("55.00"), 78, 15, "pack",
                "Classic masala instant noodles pack of 4", "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=300", retailer.getId()));

        products.add(new Product("Dettol Original Antiseptic Liquid 250ml", "DET-004", "8901396120018", "Personal Care",
                new BigDecimal("130.00"), new BigDecimal("175.00"), 24, 6, "bottle",
                "Disinfectant and first aid liquid", "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300", retailer.getId()));

        // Low stock items (alerts)
        products.add(new Product("Amul Pure Ghee 1L Tin", "AMU-005", "8901262010052", "Dairy",
                new BigDecimal("540.00"), new BigDecimal("620.00"), 3, 5, "tin",
                "Rich aroma traditional pure clarified butter", "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300", retailer.getId()));

        products.add(new Product("Aashirvaad Superior MP Sharbati Atta 5kg", "ATT-006", "8901725181044", "Groceries",
                new BigDecimal("245.00"), new BigDecimal("299.00"), 2, 6, "bag",
                "100% whole wheat flour", "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300", retailer.getId()));

        // Out of stock
        products.add(new Product("Cadbury Dairy Milk Silk 150g", "CAD-007", "8901233020087", "Snacks",
                new BigDecimal("135.00"), new BigDecimal("180.00"), 0, 10, "bar",
                "Smooth creamy chocolate bar", "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300", retailer.getId()));

        // Fast moving cash cows
        products.add(new Product("Surf Excel Easy Wash Detergent Powder 1kg", "SUR-008", "8901030381014", "Household",
                new BigDecimal("122.00"), new BigDecimal("135.00"), 50, 12, "pack",
                "Superior stain removal laundry detergent", "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=300", retailer.getId()));

        products.add(new Product("Colgate MaxFresh Blue Gel Toothpaste 150g", "COL-009", "8901314010344", "Personal Care",
                new BigDecimal("82.00"), new BigDecimal("105.00"), 40, 10, "tube",
                "Intense cooling freshness gel toothpaste", "https://images.unsplash.com/photo-1559591937-e1610e20ee6d?w=300", retailer.getId()));

        products.add(new Product("Britannia Good Day Butter Cookies 200g", "BRI-010", "8901063012017", "Snacks",
                new BigDecimal("36.00"), new BigDecimal("45.00"), 65, 15, "pack",
                "Rich butter baked crisp biscuits", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300", retailer.getId()));

        // Opportunities (High margin, slow volume)
        products.add(new Product("Raw Organic Himalayan Honey 500g", "HON-011", "8904256711099", "Groceries",
                new BigDecimal("280.00"), new BigDecimal("450.00"), 18, 4, "jar",
                "Unprocessed natural wild bee honey", "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300", retailer.getId()));

        // Underperformer / dead inventory candidate
        products.add(new Product("Exotic Kiwi Plum Herbal Beverage 300ml", "EXO-012", "8909876543210", "Beverages",
                new BigDecimal("110.00"), new BigDecimal("125.00"), 20, 5, "bottle",
                "Imported herbal infused flavored drink", "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300", retailer.getId()));

        List<Product> savedProducts = productRepository.saveAll(products);

        // 3. Seed Realistic Historical Sales Orders over past 30 days
        Random rand = new Random(42);
        PaymentMethod[] paymentMethods = {PaymentMethod.UPI, PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.UPI};
        String[] customerNames = {"Rahul Verma", "Pooja Gupta", "Amit Patel", "Sneha Roy", "Vikram Singh", "Anjali Mehta", "Suresh Kumar", "Deepa Nair"};

        List<SaleOrder> historicalOrders = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (int day = 28; day >= 0; day--) {
            int ordersToday = 2 + rand.nextInt(4); // 2 to 5 orders per day
            for (int o = 0; o < ordersToday; o++) {
                LocalDateTime orderTime = now.minusDays(day).minusHours(rand.nextInt(10)).minusMinutes(rand.nextInt(50));
                
                SaleOrder order = new SaleOrder();
                order.setRetailerId(retailer.getId());
                order.setOrderNumber(String.format("INV-%s-%04d", orderTime.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd")), 1000 + rand.nextInt(9000)));
                order.setCustomerName(customerNames[rand.nextInt(customerNames.length)]);
                order.setCustomerPhone("+91-98" + (10000000 + rand.nextInt(89999999)));
                order.setPaymentMethod(paymentMethods[rand.nextInt(paymentMethods.length)]);
                order.setCreatedAt(orderTime);

                BigDecimal subtotal = BigDecimal.ZERO;
                BigDecimal costTotal = BigDecimal.ZERO;

                // Pick 1 to 4 products for this basket
                int itemCount = 1 + rand.nextInt(3);
                Set<Integer> pickedIndices = new HashSet<>();
                for (int i = 0; i < itemCount; i++) {
                    int pIdx = rand.nextInt(savedProducts.size() - 2); // Exclude dead stock to simulate dead stock accurately
                    if (pickedIndices.contains(pIdx)) continue;
                    pickedIndices.add(pIdx);

                    Product prod = savedProducts.get(pIdx);
                    int qty = 1 + rand.nextInt(3);

                    SaleOrderItem item = new SaleOrderItem(
                            prod.getId(),
                            prod.getName(),
                            prod.getSku(),
                            prod.getCostPrice(),
                            prod.getSellingPrice(),
                            qty
                    );
                    order.addItem(item);
                    subtotal = subtotal.add(item.getItemTotal());
                    costTotal = costTotal.add(item.getItemCostTotal());
                }

                BigDecimal taxRate = new BigDecimal("5.00");
                order.setTaxRate(taxRate);
                BigDecimal taxAmount = subtotal.multiply(taxRate).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
                order.setTaxAmount(taxAmount);

                BigDecimal discount = (rand.nextInt(10) > 7) ? new BigDecimal("20.00") : BigDecimal.ZERO;
                order.setDiscountAmount(discount);

                BigDecimal totalAmount = subtotal.add(taxAmount).subtract(discount);
                order.setTotalAmount(totalAmount);
                order.setTotalCost(costTotal);

                BigDecimal netRevenue = subtotal.subtract(discount);
                BigDecimal totalProfit = netRevenue.subtract(costTotal);
                order.setTotalProfit(totalProfit);

                BigDecimal margin = (netRevenue.compareTo(BigDecimal.ZERO) > 0)
                        ? totalProfit.divide(netRevenue, 4, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(2, java.math.RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;
                order.setProfitMarginPercent(margin);

                historicalOrders.add(order);
            }
        }
        saleOrderRepository.saveAll(historicalOrders);

        // 4. Seed Wholesale Listings
        List<WholesaleListing> listings = new ArrayList<>();
        listings.add(new WholesaleListing(wholesaler.getId(), wholesaler.getBusinessName(),
                "Aashirvaad Sharbati Atta 5kg (Carton of 8 Bags)",
                "Grade-A wheat whole flour in tamper-evident retail packs", "Groceries",
                "Carton (8 x 5kg Bags)", new BigDecimal("1760.00"), 2, 50,
                new BigDecimal("5.00"), 5, "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300"));

        listings.add(new WholesaleListing(wholesaler.getId(), wholesaler.getBusinessName(),
                "Amul Pure Ghee 1L Tin (Master Case of 12 Tins)",
                "Factory direct sealed pure ghee tins with cold chain verification", "Dairy",
                "Case (12 x 1L Tins)", new BigDecimal("6000.00"), 1, 35,
                new BigDecimal("4.00"), 3, "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300"));

        listings.add(new WholesaleListing(wholesaler.getId(), wholesaler.getBusinessName(),
                "Tata Tea Premium 500g (Wholesale Box of 24 Packs)",
                "Fresh harvest premium blended tea wholesale pack", "Beverages",
                "Box (24 x 500g Packs)", new BigDecimal("4800.00"), 1, 60,
                new BigDecimal("6.00"), 4, "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300"));

        listings.add(new WholesaleListing(wholesaler.getId(), wholesaler.getBusinessName(),
                "Fortune Sunlite Sunflower Oil 1L (Carton of 15 Pouches)",
                "High stability cooking oil direct refinery batch", "Groceries",
                "Carton (15 x 1L Pouches)", new BigDecimal("1800.00"), 2, 40,
                new BigDecimal("5.00"), 5, "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300"));

        listings.add(new WholesaleListing(wholesaler.getId(), wholesaler.getBusinessName(),
                "Maggi 2-Minute Noodles (Master Box of 48 Packs)",
                "High turnover snack staple with rapid customer demand", "Snacks",
                "Box (48 Packs)", new BigDecimal("1850.00"), 2, 80,
                new BigDecimal("7.00"), 6, "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=300"));

        listings.add(new WholesaleListing(wholesaler.getId(), wholesaler.getBusinessName(),
                "Cadbury Dairy Milk Silk Chocolate (Display Box of 24 Bars)",
                "Temperature-controlled confectionary display packaging", "Snacks",
                "Display Box (24 Bars)", new BigDecimal("3000.00"), 1, 30,
                new BigDecimal("8.00"), 3, "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300"));

        wholesaleListingRepository.saveAll(listings);

        // 5. Seed Initial Purchase Orders between Retailer & Wholesaler
        PurchaseOrder po1 = new PurchaseOrder();
        po1.setOrderNumber("PO-20260820-101");
        po1.setRetailerId(retailer.getId());
        po1.setRetailerName(retailer.getFullName());
        po1.setRetailerBusinessName(retailer.getBusinessName());
        po1.setRetailerPhone(retailer.getPhone());
        po1.setWholesalerId(wholesaler.getId());
        po1.setWholesalerName(wholesaler.getBusinessName());
        po1.setListingId(listings.get(0).getId());
        po1.setProductName(listings.get(0).getTitle());
        po1.setWholesaleUnit(listings.get(0).getUnit());
        po1.setQuantity(2);
        po1.setUnitPrice(listings.get(0).getUnitPrice());
        po1.setTotalAmount(listings.get(0).getUnitPrice().multiply(BigDecimal.valueOf(2)));
        po1.setStatus(OrderStatus.DELIVERED);
        po1.setTrackingNumber("TRK-APEX-889021");
        po1.setNotes("Weekly atta restock completed.");
        po1.setRetailerProductId(savedProducts.get(5).getId());
        po1.setUnitsPerWholesalePack(8);
        purchaseOrderRepository.save(po1);

        PurchaseOrder po2 = new PurchaseOrder();
        po2.setOrderNumber("PO-20260823-205");
        po2.setRetailerId(retailer.getId());
        po2.setRetailerName(retailer.getFullName());
        po2.setRetailerBusinessName(retailer.getBusinessName());
        po2.setRetailerPhone(retailer.getPhone());
        po2.setWholesalerId(wholesaler.getId());
        po2.setWholesalerName(wholesaler.getBusinessName());
        po2.setListingId(listings.get(1).getId());
        po2.setProductName(listings.get(1).getTitle());
        po2.setWholesaleUnit(listings.get(1).getUnit());
        po2.setQuantity(1);
        po2.setUnitPrice(listings.get(1).getUnitPrice());
        po2.setTotalAmount(listings.get(1).getUnitPrice());
        po2.setStatus(OrderStatus.CONFIRMED);
        po2.setTrackingNumber("TRK-APEX-992104");
        po2.setNotes("Urgent restock for low-stock Amul Ghee tins.");
        po2.setRetailerProductId(savedProducts.get(4).getId());
        po2.setUnitsPerWholesalePack(12);
        purchaseOrderRepository.save(po2);

        logger.info("RetailInsight realistic sample database successfully initialized with {} products and {} orders!",
                savedProducts.size(), historicalOrders.size());
    }
}
