import React, { useState, useEffect } from 'react';
import { WholesaleListing, PurchaseOrder, WholesaleSummary, WholesaleListingRequest } from '../types';
import { wholesaleApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  Plus,
  Search,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Boxes,
  Building2,
  DollarSign,
  Tag,
  ArrowRight,
  ShieldCheck,
  Send,
  RefreshCw,
  X
} from 'lucide-react';

export const WholesaleMarketplacePage: React.FC = () => {
  const { role, user } = useAuth();
  const isWholesaler = role === 'ROLE_WHOLESALER';

  // Data states
  const [listings, setListings] = useState<WholesaleListing[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [wholesaleSummary, setWholesaleSummary] = useState<WholesaleSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modals / forms
  const [isNewListingModalOpen, setIsNewListingModalOpen] = useState(false);
  const [selectedListingForOrder, setSelectedListingForOrder] = useState<WholesaleListing | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Listing Form state (for wholesaler)
  const [newListing, setNewListing] = useState<WholesaleListingRequest>({
    title: '',
    description: '',
    category: 'Groceries',
    unit: 'Box (24 Packs)',
    unitPrice: 1000,
    minOrderQuantity: 1,
    stockAvailable: 50,
    bulkDiscountPercent: 5,
    bulkDiscountThreshold: 5,
    imageUrl: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    setMsg(null);
    try {
      if (isWholesaler) {
        const [myList, orders, summary] = await Promise.all([
          wholesaleApi.getMyListings(),
          wholesaleApi.getWholesalerOrders(),
          wholesaleApi.getWholesaleSummary(),
        ]);
        setListings(myList);
        setPurchaseOrders(orders);
        setWholesaleSummary(summary);
      } else {
        const [allListings, myOrders] = await Promise.all([
          wholesaleApi.getListings(),
          wholesaleApi.getRetailerOrders(),
        ]);
        setListings(allListings);
        setPurchaseOrders(myOrders);
      }
    } catch (err) {
      console.error('Failed to load wholesale marketplace data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isWholesaler]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListingForOrder) return;

    setOrderSubmitting(true);
    setMsg(null);
    try {
      await wholesaleApi.placePurchaseOrder({
        listingId: selectedListingForOrder.id,
        quantity: orderQuantity,
        unitsPerWholesalePack: 12,
        notes: orderNotes,
      });
      setMsg({ type: 'success', text: `Purchase Order placed with ${selectedListingForOrder.wholesalerName}!` });
      setSelectedListingForOrder(null);
      loadData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to place purchase order' });
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSubmitting(true);
    try {
      await wholesaleApi.createListing(newListing);
      setMsg({ type: 'success', text: 'Wholesale product listed successfully!' });
      setIsNewListingModalOpen(false);
      loadData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to create listing' });
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await wholesaleApi.updateOrderStatus(orderId, {
        status: newStatus,
        trackingNumber: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      });
      setMsg({ type: 'success', text: `Order status updated to ${newStatus}.` });
      loadData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update order status' });
    }
  };

  const categories = Array.from(new Set(listings.map((l) => l.category)));
  const filteredListings = listings.filter((l) => {
    const matchesCat = selectedCategory === 'ALL' || l.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.wholesalerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Truck className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {isWholesaler ? 'Wholesaler Supplier Portal' : 'B2B Wholesale Restock Marketplace'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isWholesaler
              ? 'Manage bulk catalog offerings, fulfill retailer restock orders, and dispatch shipments.'
              : 'Direct factory & distributor bulk buying with MOQ pricing and automated inventory replenishment.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
          {isWholesaler && (
            <button
              onClick={() => setIsNewListingModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Bulk Listing</span>
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{msg.text}</span>
          </div>
          <button onClick={() => setMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Wholesaler KPI Overview (Wholesaler only) */}
      {isWholesaler && wholesaleSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Wholesale Revenue</span>
            <h3 className="text-2xl font-black text-emerald-400 mt-1 font-mono">
              ₹{wholesaleSummary.totalWholesaleRevenue?.toLocaleString('en-IN') || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">from delivered retailer orders</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Active Bulk Listings</span>
            <h3 className="text-2xl font-black text-white mt-1">
              {wholesaleSummary.totalListings}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">catalog products listed</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Pending Orders</span>
            <h3 className="text-2xl font-black text-amber-400 mt-1">
              {wholesaleSummary.pendingOrders}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">awaiting confirmation</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Delivered Orders</span>
            <h3 className="text-2xl font-black text-purple-400 mt-1">
              {wholesaleSummary.deliveredOrders}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">fulfilled & restocked</p>
          </div>
        </div>
      )}

      {/* Restock Purchase Orders Pipeline (Shows active orders for both Retailer & Wholesaler) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white text-base">
              {isWholesaler ? 'Incoming Retailer Purchase Orders' : 'My Restock Purchase Orders'}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {purchaseOrders.length} total orders
          </span>
        </div>

        {purchaseOrders.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No purchase orders currently in progress.
          </div>
        ) : (
          <div className="space-y-3">
            {purchaseOrders.map((po) => (
              <div
                key={po.id}
                className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">{po.orderNumber}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                        po.status === 'DELIVERED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : po.status === 'SHIPPED'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : po.status === 'CONFIRMED'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {po.status}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-200">{po.productName}</p>
                  <p className="text-slate-400 text-[11px]">
                    {isWholesaler
                      ? `Buyer: ${po.retailerName} (${po.retailerBusinessName || 'Store'}) • Phone: ${po.retailerPhone || 'N/A'}`
                      : `Supplier: ${po.wholesalerName}`}
                    {po.trackingNumber && ` • Tracking: ${po.trackingNumber}`}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6">
                  <div className="text-right">
                    <p className="text-slate-400 text-[11px]">
                      {po.quantity} × ₹{po.unitPrice} ({po.wholesaleUnit})
                    </p>
                    <p className="text-base font-black text-emerald-400 font-mono">
                      ₹{po.totalAmount?.toFixed(2)}
                    </p>
                  </div>

                  {/* Wholesaler Fulfillment Actions */}
                  {isWholesaler && (
                    <div className="flex items-center gap-2">
                      {po.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(po.id, 'CONFIRMED')}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
                        >
                          Confirm PO
                        </button>
                      )}
                      {po.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(po.id, 'SHIPPED')}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                        >
                          Mark Shipped
                        </button>
                      )}
                      {po.status === 'SHIPPED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(po.id, 'DELIVERED')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                        >
                          Mark Delivered & Restock
                        </button>
                      )}
                    </div>
                  )}

                  {/* Retailer Auto-restock acknowledgment */}
                  {!isWholesaler && po.status === 'DELIVERED' && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Auto-Restocked
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wholesaler Catalog Directory */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">
              {isWholesaler ? 'My Listed Wholesale Products' : 'Explore Wholesaler Suppliers & Bulk Offers'}
            </h3>
            <p className="text-xs text-slate-400">Order by carton/box with wholesale volume pricing</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search wholesale listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((l) => (
            <div
              key={l.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative mb-3">
                  <img
                    src={l.imageUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300'}
                    alt={l.title}
                    className="w-full h-36 rounded-xl object-cover bg-slate-800"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-sm border border-slate-700 text-[10px] font-bold text-purple-300">
                    {l.category}
                  </span>
                  {l.bulkDiscountPercent && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-emerald-600/90 text-white text-[10px] font-bold">
                      {l.bulkDiscountPercent}% OFF ({l.bulkDiscountThreshold}+ packs)
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors">
                  {l.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{l.description}</p>
                <p className="text-[11px] text-purple-300 font-medium mt-2">
                  Supplier: {l.wholesalerName}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    ₹{l.unitPrice}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-1">/ {l.unit}</span>
                  <p className="text-[10px] text-slate-400">MOQ: {l.minOrderQuantity} packs • Stock: {l.stockAvailable}</p>
                </div>

                {!isWholesaler && (
                  <button
                    onClick={() => {
                      setSelectedListingForOrder(l);
                      setOrderQuantity(l.minOrderQuantity || 1);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all active:scale-95"
                  >
                    Order Bulk
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Place Purchase Order Modal */}
      {selectedListingForOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedListingForOrder(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Place Wholesale Restock Order</h3>
                <p className="text-xs text-slate-400">Supplier: {selectedListingForOrder.wholesalerName}</p>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <p className="font-bold text-white text-sm">{selectedListingForOrder.title}</p>
                <p className="text-slate-400 text-xs mt-0.5">Package: {selectedListingForOrder.unit}</p>
                <div className="flex justify-between mt-2 pt-2 border-t border-slate-700">
                  <span className="text-slate-400">Unit Price:</span>
                  <span className="font-mono font-bold text-emerald-400">₹{selectedListingForOrder.unitPrice}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Order Quantity (Wholesale Packs, Min: {selectedListingForOrder.minOrderQuantity})
                </label>
                <input
                  type="number"
                  min={selectedListingForOrder.minOrderQuantity || 1}
                  max={selectedListingForOrder.stockAvailable || 100}
                  required
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Math.max(selectedListingForOrder.minOrderQuantity || 1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-center font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Delivery Instructions / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Deliver to Shop #12 before 2 PM"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 flex justify-between items-center">
                <span className="text-slate-300 font-semibold">Total Order Amount:</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  ₹{(selectedListingForOrder.unitPrice * orderQuantity).toFixed(2)}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedListingForOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold shadow-lg shadow-purple-600/30"
                >
                  {orderSubmitting ? 'Placing Order...' : 'Confirm Restock Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Wholesale Listing Modal (for Wholesalers) */}
      {isNewListingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsNewListingModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Create New Wholesale Listing</h3>
                <p className="text-xs text-slate-400">List bulk packages for small retailers</p>
              </div>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aashirvaad Atta 5kg (Carton of 8 Bags)"
                  value={newListing.title}
                  onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="Groceries, Snacks, Dairy..."
                    value={newListing.category}
                    onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Packaging Unit *</label>
                  <input
                    type="text"
                    required
                    placeholder="Carton (8 Bags)"
                    value={newListing.unit}
                    onChange={(e) => setNewListing({ ...newListing, unit: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newListing.unitPrice}
                    onChange={(e) => setNewListing({ ...newListing, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Min Order Qty (MOQ)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newListing.minOrderQuantity}
                    onChange={(e) => setNewListing({ ...newListing, minOrderQuantity: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Available Stock</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newListing.stockAvailable}
                    onChange={(e) => setNewListing({ ...newListing, stockAvailable: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newListing.imageUrl}
                  onChange={(e) => setNewListing({ ...newListing, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Specifications, certifications, logistics..."
                  value={newListing.description}
                  onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewListingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold"
                >
                  {orderSubmitting ? 'Listing...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
