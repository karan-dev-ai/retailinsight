import React, { useEffect, useRef } from 'react';
import { SaleOrder } from '../types';
import { useAuth } from '../context/AuthContext';
import { pdfApi } from '../services/api';
import { X, Printer, Download, Receipt, CheckCircle, Percent } from 'lucide-react';
import JsBarcode from 'jsbarcode';

interface InvoiceReceiptModalProps {
  order: SaleOrder | null;
  onClose: () => void;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({ order, onClose }) => {
  const { user } = useAuth();
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (order && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, order.orderNumber, {
          format: 'CODE128',
          lineColor: '#000000',
          width: 1.8,
          height: 40,
          displayValue: true,
          fontSize: 12,
          margin: 5,
        });
      } catch (e) {
        console.error('Invoice barcode error:', e);
      }
    }
  }, [order]);

  if (!order) return null;

  const handleDownloadPdf = () => {
    window.open(pdfApi.getInvoiceUrl(order.id), '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="glass-card w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl p-6 relative max-h-[95vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors no-print"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 no-print">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Sale Completed Successfully</h3>
            <p className="text-xs text-slate-400">Invoice #{order.orderNumber}</p>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div
          id="printable-receipt"
          className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-inner overflow-y-auto flex-1 text-xs"
        >
          {/* Store Header */}
          <div className="text-center pb-4 border-b border-slate-200">
            <h2 className="font-extrabold text-base tracking-tight text-slate-900">
              {user?.businessName || 'RetailInsight Store'}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {user?.address || 'Market Avenue, Retail Hub'}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              Phone: {user?.phone || '+91-9876543210'} {user?.gstOrTaxId ? `| GSTIN: ${user.gstOrTaxId}` : ''}
            </p>
            <div className="inline-block mt-2 px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold tracking-wider uppercase text-slate-700">
              TAX INVOICE / CASH RECEIPT
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="py-3 border-b border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <p><span className="text-slate-500">Invoice:</span> <strong className="font-mono">{order.orderNumber}</strong></p>
              <p><span className="text-slate-500">Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
              <p><span className="text-slate-500">Payment:</span> <strong className="uppercase">{order.paymentMethod}</strong></p>
            </div>
            <div className="text-right">
              <p><span className="text-slate-500">Customer:</span> <strong>{order.customerName}</strong></p>
              {order.customerPhone && <p><span className="text-slate-500">Phone:</span> {order.customerPhone}</p>}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full my-3 text-[11px]">
            <thead>
              <tr className="border-b border-slate-300 text-slate-600 font-bold">
                <th className="text-left py-1">Item</th>
                <th className="text-center py-1">Qty</th>
                <th className="text-right py-1">Price</th>
                <th className="text-right py-1">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items?.map((item, idx) => (
                <tr key={idx} className="py-1">
                  <td className="py-1.5 pr-2 font-medium">{item.productName}</td>
                  <td className="py-1.5 text-center font-mono">{item.quantity}</td>
                  <td className="py-1.5 text-right font-mono">₹{item.unitSellingPrice}</td>
                  <td className="py-1.5 text-right font-mono font-bold">₹{item.itemTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculations */}
          <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">₹{order.subtotal?.toFixed(2)}</span>
            </div>
            {order.taxAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>GST / Tax ({order.taxRate}%):</span>
                <span className="font-mono">+₹{order.taxAmount?.toFixed(2)}</span>
              </div>
            )}
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount:</span>
                <span className="font-mono">-₹{order.discountAmount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-300">
              <span>GRAND TOTAL:</span>
              <span className="font-mono text-emerald-700">₹{order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          {/* Cashier Profit & Margin Summary (Retailer Only) */}
          <div className="mt-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-[11px] font-semibold no-print">
            <span className="flex items-center gap-1">
              <Percent className="w-3.5 h-3.5" />
              <span>Net Profit Earned:</span>
            </span>
            <span className="font-mono font-bold">
              ₹{order.totalProfit?.toFixed(2)} ({order.profitMarginPercent}% Margin)
            </span>
          </div>

          {/* Barcode representation */}
          <div className="mt-4 flex flex-col items-center justify-center text-center">
            <svg ref={barcodeRef} className="max-w-full"></svg>
            <p className="text-[10px] text-slate-400 mt-1">Thank you for your business!</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-colors active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
