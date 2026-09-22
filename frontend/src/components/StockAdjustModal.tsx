import React, { useState } from 'react';
import { Product, AdjustmentType, StockAdjustmentRequest } from '../types';
import { X, Boxes, AlertTriangle, Plus, Minus } from 'lucide-react';

interface StockAdjustModalProps {
  product: Product | null;
  onClose: () => void;
  onAdjust: (data: StockAdjustmentRequest) => Promise<void>;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  product,
  onClose,
  onAdjust,
}) => {
  const [changeQty, setChangeQty] = useState<number>(5);
  const [type, setType] = useState<AdjustmentType>('RESTOCK');
  const [reason, setReason] = useState<string>('Stock replenishment');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const currentStock = product.stockQuantity || 0;
  const effectiveChange = type === 'DAMAGE_LOSS' || (type === 'ADJUSTMENT' && changeQty < 0)
    ? -Math.abs(changeQty)
    : Math.abs(changeQty);

  const projectedStock = currentStock + effectiveChange;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (projectedStock < 0) {
      setError('Cannot reduce stock below 0');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onAdjust({
        productId: product.id,
        changeQty: effectiveChange,
        type,
        reason,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-card w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Adjust Stock Level</h3>
            <p className="text-xs text-slate-400">{product.name}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Current & Projected Stock summary */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div>
              <span className="text-slate-400 text-[11px]">Current Stock</span>
              <p className="text-lg font-bold text-white mt-0.5 font-mono">
                {currentStock} {product.unit}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Projected Stock</span>
              <p className={`text-lg font-bold mt-0.5 font-mono ${projectedStock <= 0 ? 'text-rose-400' : projectedStock <= product.minStockThreshold ? 'text-amber-400' : 'text-emerald-400'}`}>
                {projectedStock} {product.unit}
              </p>
            </div>
          </div>

          {/* Adjustment Type Selection */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Adjustment Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('RESTOCK');
                  setReason('Fresh supplier delivery');
                }}
                className={`py-2 px-3 rounded-xl font-semibold border text-center transition-all ${
                  type === 'RESTOCK'
                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                }`}
              >
                + Restock
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('DAMAGE_LOSS');
                  setReason('Damaged / Spoilage loss');
                }}
                className={`py-2 px-3 rounded-xl font-semibold border text-center transition-all ${
                  type === 'DAMAGE_LOSS'
                    ? 'bg-rose-600/20 text-rose-400 border-rose-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                }`}
              >
                - Damage/Loss
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('ADJUSTMENT');
                  setReason('Physical audit count');
                }}
                className={`py-2 px-3 rounded-xl font-semibold border text-center transition-all ${
                  type === 'ADJUSTMENT'
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                }`}
              >
                Audit Count
              </button>
            </div>
          </div>

          {/* Quantity Change */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Quantity to {type === 'DAMAGE_LOSS' ? 'Remove' : 'Add'}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setChangeQty((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="1"
                required
                value={changeQty}
                onChange={(e) => setChangeQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="flex-1 text-center py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-base font-bold focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setChangeQty((prev) => prev + 1)}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reason notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Reason / Reference</label>
            <input
              type="text"
              placeholder="e.g., Weekly stock delivery, broken packaging..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              {isSubmitting ? 'Updating...' : 'Save Stock Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
