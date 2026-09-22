import React, { useState, useEffect } from 'react';
import { Product, CheckoutRequest, SaleOrder, PaymentMethod } from '../types';
import { productApi, salesApi } from '../services/api';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal';
import { InvoiceReceiptModal } from '../components/InvoiceReceiptModal';
import {
  ShoppingCart,
  Barcode,
  Camera,
  Search,
  Plus,
  Minus,
  Trash2,
  Percent,
  CheckCircle,
  CreditCard,
  Banknote,
  Smartphone,
  UserCheck,
  AlertCircle,
  Sparkles,
  Receipt
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export const POSCheckoutPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);

  // Checkout inputs
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [taxRate, setTaxRate] = useState<number>(5); // 5% GST default
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // States
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<SaleOrder | null>(null);

  const loadProducts = async () => {
    try {
      const prods = await productApi.getAll();
      setProducts(prods);
    } catch (err) {
      console.error('Failed to load products for POS:', err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Barcode quick add
  const handleBarcodeSubmit = async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    setErrorMsg(null);
    const existing = products.find(
      (p) => (p.barcode && p.barcode === cleanCode) || p.sku.toLowerCase() === cleanCode.toLowerCase()
    );

    if (existing) {
      addToCart(existing);
      setBarcodeInput('');
    } else {
      try {
        const prod = await productApi.getByBarcode(cleanCode);
        addToCart(prod);
        setBarcodeInput('');
      } catch {
        setErrorMsg(`No product found matching barcode "${cleanCode}"`);
      }
    }
  };

  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      setErrorMsg(`Cannot add "${product.name}" - Out of stock`);
      return;
    }

    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx > -1) {
        const currentQty = prev[idx].quantity;
        if (currentQty >= product.stockQuantity) {
          setErrorMsg(`Max available stock for "${product.name}" is ${product.stockQuantity}`);
          return prev;
        }
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: currentQty + 1 };
        return updated;
      } else {
        return [...prev, { product, quantity: 1, unitPrice: product.sellingPrice }];
      }
    });
    setErrorMsg(null);
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stockQuantity) {
              setErrorMsg(`Max stock reached for ${item.product.name}`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setErrorMsg(null);
    setDiscountAmount(0);
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const totalCost = cart.reduce((acc, item) => acc + item.product.costPrice * item.quantity, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const netRevenue = Math.max(0, subtotal - discountAmount);
  const totalAmount = netRevenue + taxAmount;
  const estimatedProfit = netRevenue - totalCost;
  const marginPercent = netRevenue > 0 ? ((estimatedProfit / netRevenue) * 100).toFixed(1) : '0.0';

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setErrorMsg('Cart is empty. Scan barcodes or select items to bill.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const checkoutReq: CheckoutRequest = {
        customerName,
        customerPhone: customerPhone || undefined,
        paymentMethod,
        taxRate,
        discountAmount,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitSellingPrice: item.unitPrice,
        })),
      };

      const order = await salesApi.checkout(checkoutReq);
      setCompletedOrder(order);
      clearCart();
      loadProducts(); // refresh stock numbers
    } catch (err: any) {
      setErrorMsg(err.message || 'Checkout failed. Check stock availability.');
    } finally {
      setIsProcessing(false);
    }
  };

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const filteredCatalog = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4 animate-in fade-in pb-12">
      {/* Header with Barcode Scanner input */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>POS Billing Terminal</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Ready for Sale
              </span>
            </h1>
            <p className="text-xs text-slate-400">Scan barcodes or select items from catalog</p>
          </div>
        </div>

        {/* Barcode scanner action bar */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleBarcodeSubmit(barcodeInput);
            }}
            className="relative flex-1"
          >
            <Barcode className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Scan/Enter Barcode (e.g. 8901052001015)..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-emerald-500/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono shadow-inner"
              autoFocus
            />
          </form>
          <button
            onClick={() => setIsCameraScannerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-all"
            title="Open Camera Scanner"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Camera</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* POS Grid: Catalog Left (60%) + Cart Right (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Product Catalog Browser */}
        <div className="lg:col-span-7 space-y-3">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            {/* Catalog search & category filter */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Quick search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedCategory === 'ALL'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1">
            {filteredCatalog.map((prod) => {
              const isOutOfStock = prod.stockQuantity <= 0;
              const inCartQty = cart.find((i) => i.product.id === prod.id)?.quantity || 0;

              return (
                <div
                  key={prod.id}
                  onClick={() => !isOutOfStock && addToCart(prod)}
                  className={`glass-panel p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isOutOfStock
                      ? 'opacity-50 border-slate-800 cursor-not-allowed'
                      : 'hover:border-emerald-500/50 hover:bg-slate-800/60 active:scale-[0.98]'
                  }`}
                >
                  <div>
                    <div className="relative mb-2">
                      <img
                        src={prod.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150'}
                        alt={prod.name}
                        className="w-full h-24 rounded-lg object-cover bg-slate-800"
                      />
                      {inCartQty > 0 && (
                        <span className="absolute top-1.5 right-1.5 bg-emerald-600 text-white font-mono font-bold text-[11px] px-2 py-0.5 rounded-full shadow-lg">
                          {inCartQty} in cart
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-white text-xs line-clamp-1 group-hover:text-emerald-400 transition-colors">
                      {prod.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{prod.sku}</p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        ₹{prod.sellingPrice}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Stock: {prod.stockQuantity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Checkout Terminal & Cart Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Shopping Cart ({cart.reduce((a, b) => a + b.quantity, 0)} items)</h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-medium"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="my-3 space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-xs">Cart is currently empty</p>
                  <p className="text-[11px] text-slate-600">Scan a barcode or tap products to begin</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate text-xs">{item.product.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        ₹{item.unitPrice} × {item.quantity} = <span className="text-emerald-400 font-bold">₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-white text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer Details & Tax / Discount inputs */}
            <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500"
                />
                <input
                  type="tel"
                  placeholder="Customer Mobile"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 font-mono"
                />
              </div>

              {/* Tax & Discount controls */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 mb-0.5 block">GST / Tax Rate:</label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value={0}>0% (Tax Exempt)</option>
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% GST</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 mb-0.5 block">Discount (₹):</label>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0.00"
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div>
                <label className="text-[10px] text-slate-400 mb-1 block">Payment Method:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'UPI', label: 'UPI', icon: Smartphone },
                    { id: 'CASH', label: 'Cash', icon: Banknote },
                    { id: 'CARD', label: 'Card', icon: CreditCard },
                    { id: 'CREDIT', label: 'Khata', icon: UserCheck },
                  ].map((pm) => {
                    const Icon = pm.icon;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                          paymentMethod === pm.id
                            ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[10px]">{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Cashier Margin & Profit Preview Badge */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Gross Profit on this bill
                  </span>
                  <p className="text-emerald-300 font-extrabold text-sm font-mono mt-0.5">
                    ₹{estimatedProfit.toFixed(2)} ({marginPercent}% Margin)
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              {/* Final Bill Calculation */}
              <div className="space-y-1 pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>GST ({taxRate}%):</span>
                    <span className="font-mono">+₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-700">
                  <span>TOTAL PAYABLE:</span>
                  <span className="font-mono text-emerald-400 text-lg">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Complete Sale Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing || cart.length === 0}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 active:scale-98 text-sm"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{isProcessing ? 'Processing Sale...' : `Complete Sale & Print Bill (₹${totalAmount.toFixed(2)})`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Camera Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScanSuccess={handleBarcodeSubmit}
      />

      {/* Completed Invoice Receipt Modal */}
      <InvoiceReceiptModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />
    </div>
  );
};
