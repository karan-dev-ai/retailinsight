import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Store,
  Truck,
  ShieldCheck,
  Bell,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  Barcode,
  ShoppingCart
} from 'lucide-react';

interface NavbarProps {
  onOpenPos?: () => void;
  onOpenBarcodeTools?: () => void;
  lowStockCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPos, onOpenBarcodeTools, lowStockCount = 0 }) => {
  const { user, role, quickLoginAsRole, logout } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const getRoleBadge = () => {
    switch (role) {
      case 'ROLE_WHOLESALER':
        return {
          label: 'Wholesaler (Supplier)',
          icon: Truck,
          color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        };
      case 'ROLE_ADMIN':
        return {
          label: 'System Admin',
          icon: ShieldCheck,
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        };
      case 'ROLE_RETAILER':
      default:
        return {
          label: 'Retailer (Shopkeeper)',
          icon: Store,
          color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        };
    }
  };

  const badge = getRoleBadge();
  const BadgeIcon = badge.icon;

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight text-white">RetailInsight</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              v1.0 SaaS
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">
            {user?.businessName || 'Intelligent Retail & Wholesale Platform'}
          </p>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Quick POS action for retailer */}
        {role === 'ROLE_RETAILER' && onOpenPos && (
          <button
            onClick={onOpenPos}
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>POS Billing Terminal</span>
          </button>
        )}

        {/* Barcode tool shortcut */}
        {onOpenBarcodeTools && (
          <button
            onClick={onOpenBarcodeTools}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
          >
            <Barcode className="w-4 h-4 text-blue-400" />
            <span>Barcode Suite</span>
          </button>
        )}

        {/* Demo Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${badge.color}`}
          >
            <BadgeIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{badge.label}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-card border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant Demo Role Switcher</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Switch perspective with 1 click</p>
              </div>

              <div className="p-1 space-y-1">
                <button
                  onClick={() => {
                    quickLoginAsRole('RETAILER');
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                    role === 'ROLE_RETAILER'
                      ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Store className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-medium">Retailer (Shopkeeper)</div>
                    <div className="text-[10px] text-slate-400">Inventory, POS, Margins & Matrix</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    quickLoginAsRole('WHOLESALER');
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                    role === 'ROLE_WHOLESALER'
                      ? 'bg-purple-600/20 text-purple-400 font-semibold border border-purple-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Truck className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-medium">Wholesaler (Supplier)</div>
                    <div className="text-[10px] text-slate-400">Bulk Catalog & Restock Orders</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    quickLoginAsRole('ADMIN');
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                    role === 'ROLE_ADMIN'
                      ? 'bg-emerald-600/20 text-emerald-400 font-semibold border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-medium">Platform Admin</div>
                    <div className="text-[10px] text-slate-400">System overview & user audit</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">
              {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'RI'}
            </div>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-card border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-semibold text-white">{user?.fullName || 'Demo User'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'user@retailinsight.com'}</p>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    logout();
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
