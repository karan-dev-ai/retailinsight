import React, { useState, useEffect } from 'react';
import { ProfitabilityMatrix, ProductMatrixItem, DeadInventoryItem } from '../types';
import { analyticsApi, pdfApi } from '../services/api';
import {
  PieChart,
  Star,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Download,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Boxes,
  ArrowUpRight,
  Clock,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';

export const ProfitabilityMatrixPage: React.FC = () => {
  const [matrixData, setMatrixData] = useState<ProfitabilityMatrix | null>(null);
  const [deadInventory, setDeadInventory] = useState<DeadInventoryItem[]>([]);
  const [activeQuadrantTab, setActiveQuadrantTab] = useState<'ALL' | 'STARS' | 'CASH_COWS' | 'OPPORTUNITIES' | 'UNDERPERFORMERS'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mat, dead] = await Promise.all([
        analyticsApi.getProfitabilityMatrix(),
        analyticsApi.getDeadInventory(30),
      ]);
      setMatrixData(mat);
      setDeadInventory(dead);
    } catch (err) {
      console.error('Failed to load profitability matrix:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadReport = () => {
    window.open(pdfApi.getProfitLossReportUrl(), '_blank');
  };

  const getFilteredItems = (): ProductMatrixItem[] => {
    if (!matrixData) return [];
    switch (activeQuadrantTab) {
      case 'STARS':
        return matrixData.stars || [];
      case 'CASH_COWS':
        return matrixData.cashCows || [];
      case 'OPPORTUNITIES':
        return matrixData.opportunities || [];
      case 'UNDERPERFORMERS':
        return matrixData.underperformers || [];
      case 'ALL':
      default:
        return matrixData.allProducts || [];
    }
  };

  // Scatter plot data mapping
  const scatterPoints = matrixData?.allProducts.map((p) => ({
    name: p.productName,
    volume: p.unitsSold,
    margin: p.profitMarginPercent,
    quadrant: p.quadrant,
    revenue: p.totalRevenue,
  })) || [];

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case 'STAR':
        return '#10b981'; // green
      case 'CASH_COW':
        return '#3b82f6'; // blue
      case 'OPPORTUNITY':
        return '#f59e0b'; // amber
      case 'UNDERPERFORMER':
      default:
        return '#f43f5e'; // rose
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <PieChart className="w-6 h-6 text-blue-400" />
            <span>Product Profitability BCG Matrix</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            4-Quadrant intelligence categorizing products by sales velocity and gross margin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Analysis"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download P&L Audit PDF</span>
          </button>
        </div>
      </div>

      {/* 4 Quadrants Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stars */}
        <div
          onClick={() => setActiveQuadrantTab('STARS')}
          className={`glass-panel p-4 rounded-2xl border cursor-pointer transition-all ${
            activeQuadrantTab === 'STARS' ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              ★ Stars
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mt-1">
            {matrixData?.stars?.length || 0} Products
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            High Volume & High Margin. Maximum profit generators.
          </p>
        </div>

        {/* Cash Cows */}
        <div
          onClick={() => setActiveQuadrantTab('CASH_COWS')}
          className={`glass-panel p-4 rounded-2xl border cursor-pointer transition-all ${
            activeQuadrantTab === 'CASH_COWS' ? 'border-blue-500 bg-blue-950/20' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
              ▲ Cash Cows
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mt-1">
            {matrixData?.cashCows?.length || 0} Products
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            High Volume & Low/Mid Margin. High cash turnover engines.
          </p>
        </div>

        {/* Opportunities */}
        <div
          onClick={() => setActiveQuadrantTab('OPPORTUNITIES')}
          className={`glass-panel p-4 rounded-2xl border cursor-pointer transition-all ${
            activeQuadrantTab === 'OPPORTUNITIES' ? 'border-amber-500 bg-amber-950/20' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              ◆ Opportunities
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Lightbulb className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mt-1">
            {matrixData?.opportunities?.length || 0} Products
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Low Volume & High Margin. Untapped potential gems.
          </p>
        </div>

        {/* Underperformers */}
        <div
          onClick={() => setActiveQuadrantTab('UNDERPERFORMERS')}
          className={`glass-panel p-4 rounded-2xl border cursor-pointer transition-all ${
            activeQuadrantTab === 'UNDERPERFORMERS' ? 'border-rose-500 bg-rose-950/20' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
              ▼ Underperformers
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mt-1">
            {matrixData?.underperformers?.length || 0} Products
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Low Volume & Low Margin. Slow-movers & dead capital.
          </p>
        </div>
      </div>

      {/* Visual Scatter Matrix & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scatter Visual Chart (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Profitability Quadrant Map</h3>
              <p className="text-xs text-slate-400">X-Axis: Units Sold • Y-Axis: Margin %</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {scatterPoints.length} mapped items
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="volume"
                  name="Units Sold"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  unit=" units"
                />
                <YAxis
                  type="number"
                  dataKey="margin"
                  name="Margin %"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'Units Sold' ? `${value} units` : `${value}%`,
                    name,
                  ]}
                />
                <Scatter name="Products" data={scatterPoints}>
                  {scatterPoints.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getQuadrantColor(entry.quadrant)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-center gap-6 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Stars (Top Right)
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Cash Cows (Bottom Right)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Opportunities (Top Left)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Underperformers (Bottom Left)
            </span>
          </div>
        </div>

        {/* AI Strategic Insights & Recommendations (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Actionable Store Insights</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {matrixData?.summaryInsights || 'Analyzing inventory velocity patterns...'}
            </p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                <strong className="text-emerald-400 block mb-0.5">★ Star Products:</strong>
                Never let stock run out. Keep eye-level shelf placement and feature in digital marketing.
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200">
                <strong className="text-blue-400 block mb-0.5">▲ Cash Cows:</strong>
                Use their high footfall traffic to cross-sell high-margin Opportunity items or negotiate bulk distributor discounts.
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200">
                <strong className="text-rose-400 block mb-0.5">▼ Underperformers:</strong>
                Run combo deals (e.g. Buy Star + Get 50% off Underperformer) to release tied-up cash.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filterable Products Matrix Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtered View:</span>
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              {(['ALL', 'STARS', 'CASH_COWS', 'OPPORTUNITIES', 'UNDERPERFORMERS'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveQuadrantTab(tab)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    activeQuadrantTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Units Sold</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-4 text-center">Profit Margin</th>
                <th className="py-3 px-4 text-center">Classification</th>
                <th className="py-3 px-4">Recommended Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {getFilteredItems().map((item) => (
                <tr key={item.productId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{item.productName}</td>
                  <td className="py-3 px-4 text-slate-400">{item.category}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold">{item.unitsSold}</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold">
                    ₹{item.totalRevenue?.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        Number(item.profitMarginPercent) >= 20
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {item.profitMarginPercent}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border"
                      style={{
                        backgroundColor: `${getQuadrantColor(item.quadrant)}20`,
                        color: getQuadrantColor(item.quadrant),
                        borderColor: `${getQuadrantColor(item.quadrant)}40`,
                      }}
                    >
                      {item.quadrant}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-[11px] max-w-xs">
                    {item.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dead Inventory / Trapped Capital Section */}
      {deadInventory.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-rose-900/40 bg-rose-950/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-400" />
              <div>
                <h3 className="text-base font-bold text-white">
                  Dead / Slow-Moving Inventory Alert (30+ Days Inactive)
                </h3>
                <p className="text-xs text-slate-400">
                  Products in stock with zero sales over the last 30 days. Capital is currently trapped.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Total Trapped Capital:</span>
              <p className="text-lg font-black text-rose-400 font-mono">
                ₹{deadInventory.reduce((acc, item) => acc + item.tiedUpCapital, 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Unsold Stock Qty</th>
                  <th className="py-2.5 px-3 text-right">Cost Price (CP)</th>
                  <th className="py-2.5 px-3 text-right">Tied-Up Capital</th>
                  <th className="py-2.5 px-3 text-center">Days Inactive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {deadInventory.map((d) => (
                  <tr key={d.productId}>
                    <td className="py-2.5 px-3 font-bold text-white">{d.productName}</td>
                    <td className="py-2.5 px-3 text-slate-400">{d.category}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-300">
                      {d.stockQuantity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                      ₹{d.costPrice?.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400">
                      ₹{d.tiedUpCapital?.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                      {d.daysInactive}+ days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
