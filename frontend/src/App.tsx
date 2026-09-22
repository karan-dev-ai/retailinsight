import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { POSCheckoutPage } from './pages/POSCheckoutPage';
import { ProfitabilityMatrixPage } from './pages/ProfitabilityMatrixPage';
import { WholesaleMarketplacePage } from './pages/WholesaleMarketplacePage';
import { BarcodeToolsPage } from './pages/BarcodeToolsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { AuthPage } from './pages/AuthPage';
import { productApi, wholesaleApi } from './services/api';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [pendingPoCount, setPendingPoCount] = useState<number>(0);

  // Sync default tab when role changes
  useEffect(() => {
    if (role === 'ROLE_WHOLESALER') {
      setActiveTab('wholesale-dashboard');
    } else {
      setActiveTab('dashboard');
    }
  }, [role]);

  // Load badge counts
  useEffect(() => {
    if (isAuthenticated) {
      if (role !== 'ROLE_WHOLESALER') {
        productApi.getLowStock().then((prods) => setLowStockCount(prods.length)).catch(() => {});
      } else {
        wholesaleApi.getWholesaleSummary().then((sum) => setPendingPoCount(sum.pendingOrders)).catch(() => {});
      }
    }
  }, [isAuthenticated, role, activeTab]);

  // Global F2 keyboard shortcut to open POS billing terminal instantly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('pos');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 animate-pulse flex items-center justify-center shadow-2xl mb-4">
          <span className="font-black text-xl">RI</span>
        </div>
        <p className="text-xs font-semibold text-slate-400">Loading RetailInsight Platform...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onOpenPos={() => setActiveTab('pos')}
        onOpenBarcodeTools={() => setActiveTab('barcode')}
        lowStockCount={lowStockCount}
      />

      {/* Main Container: Sidebar + Active View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lowStockCount={lowStockCount}
          pendingPoCount={pendingPoCount}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950/50">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigateToInventory={() => setActiveTab('inventory')}
              onNavigateToPOS={() => setActiveTab('pos')}
              onNavigateToWholesale={() => setActiveTab('wholesale')}
            />
          )}

          {activeTab === 'inventory' && <InventoryPage />}

          {activeTab === 'pos' && <POSCheckoutPage />}

          {activeTab === 'profitability' && <ProfitabilityMatrixPage />}

          {(activeTab === 'wholesale' ||
            activeTab === 'wholesale-dashboard' ||
            activeTab === 'wholesale-catalog' ||
            activeTab === 'wholesale-orders') && <WholesaleMarketplacePage />}

          {activeTab === 'invoices' && <InvoicesPage />}

          {activeTab === 'barcode' && <BarcodeToolsPage />}
        </main>
      </div>
    </div>
  );
};
