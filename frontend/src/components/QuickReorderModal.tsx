import React, { useState, useEffect } from 'react';
import { Product, WholesaleListing, PurchaseOrderRequest } from '../types';
import { wholesaleApi } from '../services/api';
import { X, Truck, CheckCircle2, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';

interface QuickReorderModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const QuickReorderModal: React.FC<QuickReorderModalProps> = ({
  product,
  onClose,
  onSuccess,
}) => {
  const [listings, setListings] = useState<WholesaleListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<WholesaleListing | null>(null);
  const [orderQty, setOrderQty] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setIsLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      wholesaleApi.getListings().then((all) => {
        // Match by category or title keywords
        const filtered = all.filter((l) =>
          l.category.toLowerCase() === product.category.toLowerCase() ||
          product.name.toLowerCase().split(' ').some((word) => word.length > 3 && l.title.toLowerCase().includes(word))
        );

        const finalChoices = filtered.length > 0 ? filtered : all.slice(0, 4);
        setListings(finalChoices);
        if (finalChoices.length > 0) {
          setSelectedListing(finalChoices[0]);
          setOrderQty(finalChoices[0].minOrderQuantity || 1);
        }
      }).catch((err) => {
        setErrorMsg('Failed to load wholesale suppliers catalog');
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [product]);

  if (!product) return null;

  const handleSelectListing = (l: WholesaleListing) => {
    setSelectedListing(l);
    setOrderQty(Math.max(l.minOrderQuantity || 1, 1));
  };

  const handlePlaceOrder = async () => {
    if (!selectedListing) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const poReq: PurchaseOrderRequest = {
        listingId: selectedListing.id,
        quantity: orderQty,
        retailerProductId: product.id,
        unitsPerWholesalePack: 12, // default bulk pack multiplier
        notes: notes || `Restock order for low-stock ${product.name}`,
      };

      await wholesaleApi.placePurchaseOrder(poReq);
      setSuccessMsg(`Restock Purchase Order placed with ${selectedListing.wholesalerName}!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place purchase order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-card w-full max-w-xl rounded-2xl border border-slate-700 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">1-Click Wholesaler Restock</h3>
            <p className="text-xs text-slate-400">Reorder bulk units directly from verified suppliers</p>
          </div>
        </div>

        {/* Low Stock Target Badge */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold text-white">{product.name}</p>
            <p className="text-[11px] text-amber-300">
              Current Stock: <span className="font-mono font-bold">{product.stockQuantity} {product.unit}</span> (Threshold: {product.minStockThreshold})
            </p>
          </div>
          <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
            Low Stock Alert
          </span>
        </div>

        {successMsg ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
            <p className="text-sm font-bold text-white">{successMsg}</p>
            <p className="text-xs text-slate-400">Tracking updates will appear in your Wholesale Restock Hub</p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Select Wholesaler Supplier Offer</label>
              {isLoading ? (
                <div className="py-8 text-center text-slate-500">Finding suppliers...</div>
              ) : listings.length === 0 ? (
                <div className="p-4 text-center rounded-xl bg-slate-800 text-slate-400">
                  No suppliers currently listed in this category.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {listings.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => handleSelectListing(l)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedListing?.id === l.id
                          ? 'bg-purple-600/20 border-purple-500/50 shadow-md shadow-purple-500/10'
                          : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-white text-xs">{l.title}</p>
                        <p className="text-[11px] text-slate-400">
                          Supplier: <span className="text-purple-300">{l.wholesalerName}</span> • Unit: {l.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400 font-mono text-xs">₹{l.unitPrice}</p>
                        <p className="text-[10px] text-slate-400">MOQ: {l.minOrderQuantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedListing && (
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Order Quantity (Wholesale Packs):</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={selectedListing.minOrderQuantity || 1}
                      max={selectedListing.stockAvailable || 100}
                      value={orderQty}
                      onChange={(e) => setOrderQty(Math.max(selectedListing.minOrderQuantity || 1, parseInt(e.target.value, 10) || 1))}
                      className="w-20 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center font-bold text-xs"
                    />
                    <span className="text-[11px] text-slate-400 font-mono">Packs</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/80">
                  <span className="text-slate-300 font-semibold">Total PO Amount:</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    ₹{(selectedListing.unitPrice * orderQty).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting || !selectedListing}
                onClick={handlePlaceOrder}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold shadow-lg shadow-purple-600/30 transition-all active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isSubmitting ? 'Placing Order...' : 'Confirm Restock PO'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
