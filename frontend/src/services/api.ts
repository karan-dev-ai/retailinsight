import {
  AuthResponse,
  CategoryPerformance,
  CheckoutRequest,
  DashboardSummary,
  DeadInventoryItem,
  Product,
  ProductMatrixItem,
  ProductRequest,
  ProfitabilityMatrix,
  PurchaseOrder,
  PurchaseOrderRequest,
  RevenueProfitTrendPoint,
  Role,
  SaleOrder,
  StockAdjustmentLog,
  StockAdjustmentRequest,
  User,
  WholesaleListing,
  WholesaleListingRequest,
  WholesaleSummary,
} from '../types';

const rawBase = import.meta.env.VITE_API_URL || '';
const API_BASE = rawBase ? `${rawBase.replace(/\/$/, '')}/api` : '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('retailinsight_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      if (errorData.validationErrors) {
        errorMessage = Object.values(errorData.validationErrors).join(', ');
      }
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// 1. Authentication APIs
export const authApi = {
  login: (usernameOrEmail: string, password: string): Promise<AuthResponse> =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    }),

  register: (data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role: Role;
    businessName?: string;
    phone?: string;
    gstOrTaxId?: string;
    address?: string;
  }): Promise<AuthResponse> =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCurrentUser: (): Promise<User> => request('/auth/me'),

  getDemoAccounts: (): Promise<Array<{ role: string; name: string; email: string; username: string; password: string }>> =>
    request('/auth/demo-accounts'),
};

// 2. Product & Inventory APIs
export const productApi = {
  getAll: (search?: string): Promise<Product[]> =>
    request(`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  getById: (id: number): Promise<Product> => request(`/products/${id}`),

  getByBarcode: (barcode: string): Promise<Product> => request(`/products/barcode/${encodeURIComponent(barcode)}`),

  getLowStock: (): Promise<Product[]> => request('/products/low-stock'),

  getOutOfStock: (): Promise<Product[]> => request('/products/out-of-stock'),

  getCategories: (): Promise<string[]> => request('/products/categories'),

  create: (data: ProductRequest): Promise<Product> =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: ProductRequest): Promise<Product> =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number): Promise<void> =>
    request(`/products/${id}`, {
      method: 'DELETE',
    }),

  adjustStock: (data: StockAdjustmentRequest): Promise<Product> =>
    request('/products/stock-adjust', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getLogs: (productId: number): Promise<StockAdjustmentLog[]> =>
    request(`/products/${productId}/logs`),

  getAllLogs: (): Promise<StockAdjustmentLog[]> => request('/products/logs'),
};

// 3. Sales & POS Checkout APIs
export const salesApi = {
  checkout: (data: CheckoutRequest): Promise<SaleOrder> =>
    request('/sales/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getOrders: (): Promise<SaleOrder[]> => request('/sales/orders'),

  getOrderById: (id: number): Promise<SaleOrder> => request(`/sales/orders/${id}`),

  getOrderByNumber: (orderNumber: string): Promise<SaleOrder> =>
    request(`/sales/orders/number/${encodeURIComponent(orderNumber)}`),
};

// 4. Analytics & Profitability APIs
export const analyticsApi = {
  getSummary: (): Promise<DashboardSummary> => request('/analytics/summary'),

  getTrends: (range: '7d' | '30d' | '90d' = '7d'): Promise<RevenueProfitTrendPoint[]> =>
    request(`/analytics/trends?range=${range}`),

  getCategories: (): Promise<CategoryPerformance[]> => request('/analytics/categories'),

  getProfitabilityMatrix: (): Promise<ProfitabilityMatrix> => request('/analytics/profitability-matrix'),

  getDeadInventory: (days: number = 30): Promise<DeadInventoryItem[]> =>
    request(`/analytics/dead-inventory?days=${days}`),
};

// 5. Wholesale Marketplace APIs
export const wholesaleApi = {
  getListings: (search?: string): Promise<WholesaleListing[]> =>
    request(`/wholesale/listings${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  getMyListings: (): Promise<WholesaleListing[]> => request('/wholesale/my-listings'),

  createListing: (data: WholesaleListingRequest): Promise<WholesaleListing> =>
    request('/wholesale/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateListing: (id: number, data: WholesaleListingRequest): Promise<WholesaleListing> =>
    request(`/wholesale/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteListing: (id: number): Promise<void> =>
    request(`/wholesale/listings/${id}`, {
      method: 'DELETE',
    }),

  placePurchaseOrder: (data: PurchaseOrderRequest): Promise<PurchaseOrder> =>
    request('/wholesale/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getRetailerOrders: (): Promise<PurchaseOrder[]> => request('/wholesale/orders/retailer'),

  getWholesalerOrders: (): Promise<PurchaseOrder[]> => request('/wholesale/orders/wholesaler'),

  updateOrderStatus: (
    id: number,
    data: { status: string; trackingNumber?: string; notes?: string }
  ): Promise<PurchaseOrder> =>
    request(`/wholesale/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getWholesaleSummary: (): Promise<WholesaleSummary> => request('/wholesale/summary'),
};

// 6. Barcode APIs
export const barcodeApi = {
  getBase64: (
    code: string,
    format: 'CODE_128' | 'EAN_13' | 'QR_CODE' = 'CODE_128',
    width: number = 250,
    height: number = 80
  ): Promise<{ code: string; format: string; dataUrl: string }> =>
    request(`/barcode/base64?code=${encodeURIComponent(code)}&format=${format}&width=${width}&height=${height}`),
};

// 7. PDF Report Download URLs
export const pdfApi = {
  getInvoiceUrl: (orderId: number) => `${API_BASE}/pdf/invoice/${orderId}`,
  getInvoiceByNumberUrl: (orderNumber: string) => `${API_BASE}/pdf/invoice/number/${encodeURIComponent(orderNumber)}`,
  getProfitLossReportUrl: () => `${API_BASE}/pdf/profit-loss-report`,
};
