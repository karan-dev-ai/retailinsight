import React, { useState, useEffect } from 'react';
import { DashboardSummary, RevenueProfitTrendPoint, CategoryPerformance, Product } from '../types';
import { analyticsApi, productApi } from '../services/api';
import { StatCard } from '../components/StatCard';
import { QuickReorderModal } from '../components/QuickReorderModal';
import {
  DollarSign,
  TrendingUp,
  Boxes,
  AlertTriangle,
  ShoppingCart,
  Percent,
  Sparkles,
  ArrowUpRight,
  Package,
  Layers,
  Truck,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardPageProps {
  onNavigateToInventory: () => void;
  onNavigateToPOS: () => void;
  onNavigateToWholesale: () => void;
}

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToInventory,
  onNavigateToPOS,
  onNavigateToWholesale,
}) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<RevenueProfitTrendPoint[]>([]);
  const [trendRange, setTrendRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [categories, setCategories] = useState<CategoryPerformance[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [selectedReorderProduct, setSelectedReorderProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sum, tr, cats, low] = await Promise.all([
        analyticsApi.getSummary(),
        analyticsApi.getTrends(trendRange),
        analyticsApi.getCategories(),
        productApi.getLowStock(),
      ]);
      setSummary(sum);
      setTrends(tr);
      setCategories(cats);
      setLowStockProducts(low);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [trendRange]);

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Retail Executive Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time sales velocity, automated profit calculations, and stock health alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          <button
            onClick={onNavigateToPOS}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Launch POS Terminal</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Lifetime Revenue"
          value={summary ? `₹${summary.totalRevenue?.toLocaleString('en-IN')}` : '₹0'}
          subtitle={`Today: ₹${summary?.todayRevenue?.toLocaleString('en-IN') || 0}`}
          change="+14.2%"
          isPositive={true}
          icon={DollarSign}
          iconColor="text-emerald-400"
          bgColor="bg-emerald-500/10 border-emerald-500/20"
        />

        <StatCard
          title="Total Net Profit"
          value={summary ? `₹${summary.totalProfit?.toLocaleString('en-IN')}` : '₹0'}
          subtitle={`Today: ₹${summary?.todayProfit?.toLocaleString('en-IN') || 0}`}
          change={`${summary?.profitMarginPercent || 0}% Gross Margin`}
          isPositive={true}
          icon={TrendingUp}
          iconColor="text-blue-400"
          bgColor="bg-blue-500/10 border-blue-500/20"
        />

        <StatCard
          title="Overall Profit Margin"
          value={summary ? `${summary.profitMarginPercent}%` : '0%'}
          subtitle="Net return on inventory sold"
          change="Healthy Margin"
          isPositive={Number(summary?.profitMarginPercent || 0) >= 15}
          icon={Percent}
          iconColor="text-amber-400"
          bgColor="bg-amber-500/10 border-amber-500/20"
        />

        <StatCard
          title="Tied-Up Stock Capital"
          value={summary ? `₹${summary.tiedUpInventoryCapital?.toLocaleString('en-IN')}` : '₹0'}
          subtitle={`${summary?.totalProducts || 0} active products in catalog`}
          change={`${summary?.lowStockCount || 0} items low in stock`}
          isPositive={false}
          icon={Boxes}
          iconColor="text-purple-400"
          bgColor="bg-purple-500/10 border-purple-500/20"
        />
      </div>

      {/* Urgent Low-Stock Restock Alert Banner (if any) */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Inventory Alert: {lowStockProducts.length} Product(s) Below Safety Threshold</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-200">
                  Action Required
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Prevent lost retail sales by placing a 1-click wholesale restock order with verified suppliers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {lowStockProducts.slice(0, 3).map((prod) => (
              <button
                key={prod.id}
                onClick={() => setSelectedReorderProduct(prod)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-white transition-all hover:border-purple-500/50"
              >
                <Truck className="w-3.5 h-3.5 text-purple-400" />
                <span>Reorder {prod.name.split(' ')[0]}</span>
              </button>
            ))}
            <button
              onClick={onNavigateToInventory}
              className="px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 underline underline-offset-4"
            >
              View All Low Stock
            </button>
          </div>
        </div>
      )}

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Profit Trends Chart (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Revenue vs Cost vs Net Profit Trends</span>
              </h3>
              <p className="text-xs text-slate-400">Historical performance timeline</p>
            </div>

            {/* Time range toggle */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              {(['7d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTrendRange(r)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    trendRange === r
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="periodLabel" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Sales Revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Net Profit"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProf)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut (1 col) */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Sales by Category</span>
            </h3>
            <p className="text-xs text-slate-400">Share of revenue distribution</p>
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={categories}
                  dataKey="totalRevenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(v: any) => [`₹${Number(v).toFixed(2)}`, 'Revenue']}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 text-xs">
            {categories.map((c, idx) => (
              <div key={c.category} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  ></span>
                  <span className="font-medium">{c.category}</span>
                </div>
                <div className="font-mono text-slate-400">
                  ₹{c.totalRevenue?.toLocaleString('en-IN')} ({c.revenueSharePercent}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access Reorder Modal */}
      {selectedReorderProduct && (
        <QuickReorderModal
          product={selectedReorderProduct}
          onClose={() => setSelectedReorderProduct(null)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};
