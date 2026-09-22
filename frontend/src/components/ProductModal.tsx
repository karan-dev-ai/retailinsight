import React, { useState, useEffect } from 'react';
import { Product, ProductRequest } from '../types';
import { X, Sparkles, AlertCircle, Percent, DollarSign, Barcode, Hash } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProductRequest) => Promise<void>;
  product?: Product | null;
  categories: string[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  categories,
}) => {
  const [formData, setFormData] = useState<ProductRequest>({
    name: '',
    sku: '',
    barcode: '',
    category: 'Groceries',
    costPrice: 0,
    sellingPrice: 0,
    stockQuantity: 10,
    minStockThreshold: 5,
    unit: 'pcs',
    description: '',
    imageUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || '',
        category: product.category,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        stockQuantity: product.stockQuantity,
        minStockThreshold: product.minStockThreshold,
        unit: product.unit || 'pcs',
        description: product.description || '',
        imageUrl: product.imageUrl || '',
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        barcode: '',
        category: categories.length > 0 ? categories[0] : 'Groceries',
        costPrice: 0,
        sellingPrice: 0,
        stockQuantity: 10,
        minStockThreshold: 5,
        unit: 'pcs',
        description: '',
        imageUrl: '',
      });
    }
    setError(null);
  }, [product, isOpen, categories]);

  if (!isOpen) return null;

  // Real-time Margin calculations
  const cost = Number(formData.costPrice) || 0;
  const selling = Number(formData.sellingPrice) || 0;
  const unitProfit = selling - cost;
  const marginPercent = selling > 0 ? ((unitProfit / selling) * 100).toFixed(1) : '0.0';

  const handleAutoGenerateSku = () => {
    const prefix = formData.category.substring(0, 3).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, sku: `${prefix}-${rand}` }));
  };

  const handleAutoGenerateBarcode = () => {
    let code = '890';
    for (let i = 0; i < 9; i++) {
      code += Math.floor(Math.random() * 10);
    }
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const d = parseInt(code[i], 10);
      sum += i % 2 === 0 ? d : d * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    code += checkDigit;
    setFormData((prev) => ({ ...prev, barcode: code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (formData.costPrice <= 0 || formData.sellingPrice <= 0) {
      setError('Cost price and selling price must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-card w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {product ? 'Edit Product Details' : 'Add New Retail Product'}
            </h3>
            <p className="text-xs text-slate-400">Manage catalog, pricing, and live inventory thresholds</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Product Name */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Tata Tea Premium 500g"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* SKU & Barcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">SKU (Stock Code) *</label>
                <button
                  type="button"
                  onClick={handleAutoGenerateSku}
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Hash className="w-3 h-3" /> Auto
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="TEA-001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">Barcode (EAN-13 / Code128)</label>
                <button
                  type="button"
                  onClick={handleAutoGenerateBarcode}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <Barcode className="w-3 h-3" /> Gen EAN
                </button>
              </div>
              <input
                type="text"
                placeholder="8901052001015"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Category *</label>
              <input
                type="text"
                required
                list="category-suggestions"
                placeholder="Groceries, Beverages, Snacks, Dairy..."
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
              <datalist id="category-suggestions">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Unit of Measure *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="pack">Pack</option>
                <option value="pouch">Pouch</option>
                <option value="bottle">Bottle</option>
                <option value="box">Box</option>
                <option value="tin">Tin</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="litre">Litre (L)</option>
              </select>
            </div>
          </div>

          {/* Pricing & Real-time Margin Calculator Badge */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Pricing & Profit Margins</span>
              </span>

              {/* Real-time Profit Margin Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 ${
                    Number(marginPercent) >= 20
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : Number(marginPercent) > 0
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  <Percent className="w-3 h-3" />
                  {marginPercent}% Margin
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  (₹{unitProfit >= 0 ? `+${unitProfit.toFixed(2)}` : unitProfit.toFixed(2)} profit/unit)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Cost Price (CP ₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="210.00"
                  value={formData.costPrice || ''}
                  onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Selling Price (MRP ₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="275.00"
                  value={formData.sellingPrice || ''}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Stock & Low-Stock Alert Threshold */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Initial Stock Qty *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Low Stock Alert Threshold *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.minStockThreshold}
                onChange={(e) => setFormData({ ...formData, minStockThreshold: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Image & Description */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Image URL (Optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Product notes, packaging specifications..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
