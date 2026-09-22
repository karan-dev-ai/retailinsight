export type Role = 'ROLE_RETAILER' | 'ROLE_WHOLESALER' | 'ROLE_ADMIN';

export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'CREDIT';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type AdjustmentType = 'SALE' | 'RESTOCK' | 'ADJUSTMENT' | 'DAMAGE_LOSS' | 'WHOLESALE_PURCHASE';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  businessName?: string;
  gstOrTaxId?: string;
  address?: string;
  role: Role;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  businessName?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockThreshold: number;
  unit: string;
  description?: string;
  imageUrl?: string;
  retailerId: number;
  createdAt?: string;
  updatedAt?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  grossProfitPerUnit?: number;
  marginPercentage?: number;
}

export interface ProductRequest {
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockThreshold: number;
  unit: string;
  description?: string;
  imageUrl?: string;
}

export interface StockAdjustmentRequest {
  productId: number;
  changeQty: number;
  type: AdjustmentType;
  reason?: string;
}

export interface StockAdjustmentLog {
  id: number;
  productId: number;
  productName: string;
  retailerId: number;
  changeQty: number;
  previousQty: number;
  newQty: number;
  type: AdjustmentType;
  reason?: string;
  createdAt: string;
}

export interface SaleOrderItem {
  id?: number;
  productId: number;
  productName: string;
  productSku?: string;
  unitCostPrice: number;
  unitSellingPrice: number;
  quantity: number;
  itemTotal: number;
  itemCostTotal: number;
  itemProfit: number;
}

export interface SaleOrder {
  id: number;
  orderNumber: string;
  retailerId: number;
  customerName: string;
  customerPhone?: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  totalCost: number;
  totalProfit: number;
  profitMarginPercent: number;
  items: SaleOrderItem[];
  createdAt: string;
}

export interface CheckoutItemRequest {
  productId: number;
  quantity: number;
  unitSellingPrice?: number;
}

export interface CheckoutRequest {
  customerName?: string;
  customerPhone?: string;
  paymentMethod: PaymentMethod;
  taxRate?: number;
  discountAmount?: number;
  items: CheckoutItemRequest[];
}

export interface DashboardSummary {
  totalRevenue: number;
  totalProfit: number;
  profitMarginPercent: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  todayRevenue: number;
  todayProfit: number;
  todayOrders: number;
  weekRevenue: number;
  weekProfit: number;
  monthRevenue: number;
  monthProfit: number;
  tiedUpInventoryCapital: number;
}

export interface RevenueProfitTrendPoint {
  periodLabel: string;
  revenue: number;
  cost: number;
  profit: number;
  ordersCount: number;
}

export interface CategoryPerformance {
  category: string;
  totalRevenue: number;
  totalProfit: number;
  unitsSold: number;
  marginPercent: number;
  revenueSharePercent: number;
}

export interface ProductMatrixItem {
  productId: number;
  productName: string;
  category: string;
  unitsSold: number;
  totalRevenue: number;
  totalProfit: number;
  profitMarginPercent: number;
  stockQuantity: number;
  quadrant: 'STAR' | 'CASH_COW' | 'OPPORTUNITY' | 'UNDERPERFORMER';
  recommendation: string;
}

export interface ProfitabilityMatrix {
  stars: ProductMatrixItem[];
  cashCows: ProductMatrixItem[];
  opportunities: ProductMatrixItem[];
  underperformers: ProductMatrixItem[];
  allProducts: ProductMatrixItem[];
  summaryInsights: string;
}

export interface DeadInventoryItem {
  productId: number;
  productName: string;
  category: string;
  stockQuantity: number;
  costPrice: number;
  tiedUpCapital: number;
  lastSoldDate?: string;
  daysInactive: number;
}

export interface WholesaleListing {
  id: number;
  wholesalerId: number;
  wholesalerName: string;
  title: string;
  description?: string;
  category: string;
  unit: string;
  unitPrice: number;
  minOrderQuantity: number;
  stockAvailable: number;
  bulkDiscountPercent?: number;
  bulkDiscountThreshold?: number;
  imageUrl?: string;
  createdAt?: string;
}

export interface WholesaleListingRequest {
  title: string;
  description?: string;
  category: string;
  unit: string;
  unitPrice: number;
  minOrderQuantity: number;
  stockAvailable: number;
  bulkDiscountPercent?: number;
  bulkDiscountThreshold?: number;
  imageUrl?: string;
}

export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  retailerId: number;
  retailerName: string;
  retailerBusinessName?: string;
  retailerPhone?: string;
  wholesalerId: number;
  wholesalerName: string;
  listingId: number;
  productName: string;
  wholesaleUnit: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  trackingNumber?: string;
  retailerProductId?: number;
  unitsPerWholesalePack: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderRequest {
  listingId: number;
  quantity: number;
  retailerProductId?: number;
  unitsPerWholesalePack?: number;
  notes?: string;
}

export interface WholesaleSummary {
  totalListings: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  totalWholesaleRevenue: number;
}
