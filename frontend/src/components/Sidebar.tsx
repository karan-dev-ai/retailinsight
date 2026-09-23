import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  PieChart,
  Truck,
  ReceiptText,
  Barcode,
  Sparkles,
  AlertTriangle,
  Building2,
  PackagePlus,
  ClipboardList,
  Database,
  Menu,
  X
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'inventory'
  | 'pos'
  | 'profitability'
  | 'wholesale'
  | 'invoices'
  | 'barcode'
  | 'schema'
  | 'wholesale-dashboard'
  | 'wholesale-catalog'
  | 'wholesale-orders';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  lowStockCount?: number;
  pendingPoCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  lowStockCount = 0,
  pendingPoCount = 0,
}) => {
  const { role, user } = useAuth();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const isWholesaler = role === 'ROLE_WHOLESALER';

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    setIsMobileDrawerOpen(false);
  };

  return (
    <>
      {/* 1. Desktop Sidebar (Hidden on mobile, visible on md+) */}
      <aside className="hidden md:flex w-64 bg-slate-900/95 border-r border-slate-800 flex-col h-[calc(100vh-4rem)] p-4 select-none shrink-0">
        <div className="flex-1 space-y-6 overflow-y-auto pr-1">
          {!isWholesaler ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
                Retail Operations
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => handleTabClick('dashboard')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard Overview</span>
                  </div>
                </button>

                <button
                  onClick={() => handleTabClick('pos')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'pos'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-4 h-4" />
                    <span>POS Checkout Terminal</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                    F2
                  </span>
                </button>

                <button
                  onClick={() => handleTabClick('inventory')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'inventory'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Boxes className="w-4 h-4" />
                    <span>Product & Stock</span>
                  </div>
                  {lowStockCount > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      {lowStockCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleTabClick('profitability')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'profitability'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <PieChart className="w-4 h-4" />
                    <span>Profitability & BCG Matrix</span>
                  </div>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
                    AI Matrix
                  </span>
                </button>

                <button
                  onClick={() => handleTabClick('wholesale')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'wholesale'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4" />
                    <span>Wholesale Restock Hub</span>
                  </div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">
                    B2B
                  </span>
                </button>

                <button
                  onClick={() => handleTabClick('invoices')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'invoices'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ReceiptText className="w-4 h-4" />
                    <span>Invoices & Sales Logs</span>
                  </div>
                </button>

                <button
                  onClick={() => handleTabClick('barcode')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'barcode'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Barcode className="w-4 h-4" />
                    <span>Barcode & Label Studio</span>
                  </div>
                </button>

                <button
                  onClick={() => handleTabClick('schema')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'schema'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>Database & Schema</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                    PostgreSQL
                  </span>
                </button>
              </nav>
            </div>
          ) : (
            /* Wholesaler Navigation */
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-purple-400 px-3 mb-2">
                Wholesaler Portal
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => handleTabClick('wholesale-dashboard')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'wholesale-dashboard'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Supplier Dashboard</span>
                  </div>
                </button>

                <button
                  onClick={() => handleTabClick('wholesale-orders')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'wholesale-orders'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-4 h-4" />
                    <span>Incoming Retailer Orders</span>
                  </div>
                  {pendingPoCount > 0 && (
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      {pendingPoCount} new
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleTabClick('wholesale-catalog')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'wholesale-catalog'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <PackagePlus className="w-4 h-4" />
                    <span>Manage Bulk Listings</span>
                  </div>
                </button>

                <button
                  onClick={() => handleTabClick('barcode')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'barcode'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Barcode className="w-4 h-4" />
                    <span>Barcode Tools</span>
                  </div>
                </button>

                <button
                  onClick={() => handleTabClick('schema')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'schema'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>Database & Schema</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                    PostgreSQL
                  </span>
                </button>
              </nav>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-800">
          <div className="glass-panel p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-200">RetailInsight 2026</p>
              <p className="text-[10px] text-slate-400">PostgreSQL + Spring + React</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Bottom Navigation Bar (Visible on mobile screens < md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around select-none">
        <button
          onClick={() => handleTabClick(isWholesaler ? 'wholesale-dashboard' : 'dashboard')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-semibold transition-colors ${
            activeTab === 'dashboard' || activeTab === 'wholesale-dashboard'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </button>

        {!isWholesaler && (
          <button
            onClick={() => handleTabClick('pos')}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-semibold transition-colors ${
              activeTab === 'pos' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span>POS Bill</span>
          </button>
        )}

        <button
          onClick={() => handleTabClick(isWholesaler ? 'wholesale-catalog' : 'inventory')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-semibold transition-colors relative ${
            activeTab === 'inventory' || activeTab === 'wholesale-catalog'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400'
          }`}
        >
          <Boxes className="w-5 h-5" />
          <span>Stock</span>
          {lowStockCount > 0 && !isWholesaler && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => handleTabClick(isWholesaler ? 'wholesale-orders' : 'wholesale')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-semibold transition-colors ${
            activeTab === 'wholesale' || activeTab === 'wholesale-orders'
              ? 'text-purple-400 font-bold'
              : 'text-slate-400'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span>{isWholesaler ? 'Orders' : 'Restock'}</span>
        </button>

        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-semibold text-slate-400 hover:text-slate-200"
        >
          <Menu className="w-5 h-5" />
          <span>Menu</span>
        </button>
      </div>

      {/* 3. Mobile Slide-out Drawer Sheet */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm animate-in fade-in flex flex-col justify-end">
          <div className="bg-slate-900 border-t border-slate-700 rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Navigation Menu</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  {role?.replace('ROLE_', '')}
                </span>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => handleTabClick('profitability')}
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2.5"
              >
                <PieChart className="w-4 h-4 text-indigo-400" />
                <span>BCG Matrix</span>
              </button>

              <button
                onClick={() => handleTabClick('invoices')}
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2.5"
              >
                <ReceiptText className="w-4 h-4 text-emerald-400" />
                <span>Sales Invoices</span>
              </button>

              <button
                onClick={() => handleTabClick('barcode')}
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2.5"
              >
                <Barcode className="w-4 h-4 text-blue-400" />
                <span>Barcode Studio</span>
              </button>

              <button
                onClick={() => handleTabClick('schema')}
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2.5"
              >
                <Database className="w-4 h-4 text-purple-400" />
                <span>Postgres Schema</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
