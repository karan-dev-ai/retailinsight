import React, { useState, useEffect } from 'react';
import { Product, ProductRequest, StockAdjustmentRequest } from '../types';
import { productApi } from '../services/api';
import { ProductModal } from '../components/ProductModal';
import { BarcodeModal } from '../components/BarcodeModal';
import { StockAdjustModal } from '../components/StockAdjustModal';
import { QuickReorderModal } from '../components/QuickReorderModal';
import {
  Boxes,
  Plus,
  Search,
  Barcode,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Truck,
  Filter,
  ArrowUpDown,
  Download,
  Percent,
  RefreshCw
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStockFilter, setSelectedStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [adjustStockProduct, setAdjustStockProduct] = useState<Product | null>(null);
  const [reorderProduct, setReorderProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        productApi.getAll(),
        productApi.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSaveProduct = async (data: ProductRequest) => {
    if (editingProduct) {
      await productApi.update(editingProduct.id, data);
    } else {
      await productApi.create(data);
    }
    loadProducts();
  };

  const handleAdjustStock = async (data: StockAdjustmentRequest) => {
    await productApi.adjustStock(data);
    loadProducts();
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
      await productApi.delete(id);
      loadProducts();
    }
  };

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery)) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || p.category.toLowerCase() === selectedCategory.toLowerCase();

    const isOutOfStock = p.stockQuantity <= 0;
    const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= p.minStockThreshold;

    let matchesStock = true;
    if (selectedStockFilter === 'IN_STOCK') matchesStock = !isOutOfStock && !isLowStock;
    if (selectedStockFilter === 'LOW_STOCK') matchesStock = isLowStock;
    if (selectedStockFilter === 'OUT_OF_STOCK') matchesStock = isOutOfStock;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleExportCsv = () => {
    const headers = ['ID', 'Product Name', 'SKU', 'Barcode', 'Category', 'Cost Price', 'Selling Price', 'Margin %', 'Stock Qty', 'Unit'];
    const rows = filteredProducts.map((p) => [
      p.id,
      `"${p.name}"`,
      p.sku,
      p.barcode || '',
      p.category,
      p.costPrice,
      p.sellingPrice,
      p.sellingPrice > 0 ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1) : 0,
      p.stockQuantity,
      p.unit,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RetailInsight_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-blue-400" />
            <span>Product Inventory & Stock Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock tracking, barcode labels, and automated profit margins.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by name, SKU, barcode, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Stock Health Badges Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 text-xs">
            <button
              onClick={() => setSelectedStockFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedStockFilter === 'ALL' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setSelectedStockFilter('LOW_STOCK')}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                selectedStockFilter === 'LOW_STOCK' ? 'bg-amber-600 text-white font-semibold' : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Low Stock ({products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockThreshold).length})
            </button>
            <button
              onClick={() => setSelectedStockFilter('OUT_OF_STOCK')}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                selectedStockFilter === 'OUT_OF_STOCK' ? 'bg-rose-600 text-white font-semibold' : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <XCircle className="w-3 h-3" />
              Out of Stock ({products.filter((p) => p.stockQuantity <= 0).length})
            </button>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mr-1">Categories:</span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-lg transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                selectedCategory.toLowerCase() === c.toLowerCase()
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Products Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-4">Product Info</th>
                <th className="py-3 px-4">SKU / Barcode</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Cost Price (CP)</th>
                <th className="py-3 px-4 text-right">Selling Price (MRP)</th>
                <th className="py-3 px-4 text-center">Profit Margin</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
                    Loading inventory catalog...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No products matched your search or filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOutOfStock = p.stockQuantity <= 0;
                  const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= p.minStockThreshold;
                  const profitUnit = p.sellingPrice - p.costPrice;
                  const marginPct = p.sellingPrice > 0 ? ((profitUnit / p.sellingPrice) * 100).toFixed(1) : '0';

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80'}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover bg-slate-800 border border-slate-700"
                          />
                          <div>
                            <p className="font-bold text-white group-hover:text-blue-400 transition-colors">
                              {p.name}
                            </p>
                            {p.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                                {p.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SKU / Barcode */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                        <div>{p.sku}</div>
                        {p.barcode && <div className="text-slate-500">{p.barcode}</div>}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-medium text-[11px]">
                          {p.category}
                        </span>
                      </td>

                      {/* Cost Price */}
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        ₹{p.costPrice?.toFixed(2)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        ₹{p.sellingPrice?.toFixed(2)}
                      </td>

                      {/* Margin % */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            Number(marginPct) >= 20
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : Number(marginPct) > 0
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          <Percent className="w-3 h-3" />
                          {marginPct}%
                        </span>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <XCircle className="w-3 h-3" />
                            0 {p.unit} (Out of Stock)
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            {p.stockQuantity} {p.unit} (Low Stock)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            {p.stockQuantity} {p.unit}
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click Reorder button for low/out of stock */}
                          {(isLowStock || isOutOfStock) && (
                            <button
                              onClick={() => setReorderProduct(p)}
                              title="1-Click Wholesale Restock"
                              className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 transition-colors"
                            >
                              <Truck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Adjust Stock Button */}
                          <button
                            onClick={() => setAdjustStockProduct(p)}
                            title="Adjust Stock Count"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                          >
                            <Boxes className="w-3.5 h-3.5" />
                          </button>

                          {/* View Barcode */}
                          <button
                            onClick={() => setBarcodeProduct(p)}
                            title="Generate & Print Barcode Label"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 transition-colors"
                          >
                            <Barcode className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Product */}
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            title="Edit Product"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-blue-400 hover:bg-slate-700 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Product */}
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            title="Delete Product"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
        categories={categories}
      />

      {/* Barcode Label Modal */}
      <BarcodeModal
        product={barcodeProduct}
        onClose={() => setBarcodeProduct(null)}
      />

      {/* Stock Adjust Modal */}
      <StockAdjustModal
        product={adjustStockProduct}
        onClose={() => setAdjustStockProduct(null)}
        onAdjust={handleAdjustStock}
      />

      {/* 1-Click Wholesale Restock Modal */}
      {reorderProduct && (
        <QuickReorderModal
          product={reorderProduct}
          onClose={() => setReorderProduct(null)}
          onSuccess={() => {
            loadProducts();
          }}
        />
      )}
    </div>
  );
};
