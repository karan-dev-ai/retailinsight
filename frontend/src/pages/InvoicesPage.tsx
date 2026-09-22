import React, { useState, useEffect } from 'react';
import { SaleOrder } from '../types';
import { salesApi, pdfApi } from '../services/api';
import { InvoiceReceiptModal } from '../components/InvoiceReceiptModal';
import {
  ReceiptText,
  Search,
  Download,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  Percent,
  RefreshCw
} from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const [orders, setOrders] = useState<SaleOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SaleOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const ords = await salesApi.getOrders();
      setOrders(ords);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const query = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      (o.customerPhone && o.customerPhone.includes(query)) ||
      o.paymentMethod.toLowerCase().includes(query)
    );
  });

  const totalSalesVolume = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalNetProfit = orders.reduce((acc, o) => acc + (o.totalProfit || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <ReceiptText className="w-6 h-6 text-blue-400" />
            <span>Sales Invoices & Transactions History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete billing records, tax calculations, customer receipts, and downloadable PDF statements.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>

      {/* Summary Mini KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Transactions</span>
          <h3 className="text-2xl font-black text-white mt-1 font-mono">{orders.length}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Recorded invoices</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Invoiced Amount</span>
          <h3 className="text-2xl font-black text-emerald-400 mt-1 font-mono">
            ₹{totalSalesVolume.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Cumulative sales revenue</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Gross Profit</span>
          <h3 className="text-2xl font-black text-blue-400 mt-1 font-mono">
            ₹{totalNetProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Calculated net margin</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice number (e.g. INV-2026...), customer name, phone, payment method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Invoices Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Tax (GST)</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Net Profit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
                    Loading invoice history...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}{' '}
                      <span className="text-slate-500 text-[10px]">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{order.customerName}</div>
                      {order.customerPhone && (
                        <div className="text-slate-500 font-mono text-[10px]">{order.customerPhone}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-300">
                      {order.items?.length || 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 font-semibold text-[10px] uppercase text-slate-300">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      ₹{order.subtotal?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      ₹{order.taxAmount?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      ₹{order.totalAmount?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-blue-300 font-semibold">
                      ₹{order.totalProfit?.toFixed(2)} ({order.profitMarginPercent}%)
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          title="View Bill Receipt"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => window.open(pdfApi.getInvoiceUrl(order.id), '_blank')}
                          title="Download PDF Invoice"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal Preview */}
      <InvoiceReceiptModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};
