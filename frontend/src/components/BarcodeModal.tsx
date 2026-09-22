import React, { useEffect, useRef } from 'react';
import { Product } from '../types';
import { X, Printer, Download, Barcode as BarcodeIcon } from 'lucide-react';
import JsBarcode from 'jsbarcode';

interface BarcodeModalProps {
  product: Product | null;
  onClose: () => void;
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({ product, onClose }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (product && product.barcode && svgRef.current) {
      try {
        JsBarcode(svgRef.current, product.barcode, {
          format: 'CODE128',
          lineColor: '#000000',
          width: 2,
          height: 70,
          displayValue: true,
          font: 'monospace',
          fontSize: 14,
          margin: 10,
        });
      } catch (err) {
        console.error('Barcode rendering error:', err);
      }
    }
  }, [product]);

  if (!product) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const a = document.createElement('a');
        a.download = `barcode-${product.sku || product.name}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
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
            <BarcodeIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Barcode Label</h3>
            <p className="text-xs text-slate-400">Ready for product packaging & scanning</p>
          </div>
        </div>

        {/* Printable Label Box */}
        <div
          id="printable-receipt"
          className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-inner flex flex-col items-center justify-center text-center"
        >
          <p className="font-bold text-sm text-slate-900 tracking-tight">{product.name}</p>
          <div className="flex items-center gap-3 text-xs text-slate-600 font-mono mt-0.5">
            <span>SKU: {product.sku}</span>
            <span>•</span>
            <span>MRP: ₹{product.sellingPrice}</span>
          </div>

          <div className="my-3 flex items-center justify-center">
            <svg ref={svgRef} className="max-w-full"></svg>
          </div>

          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            RetailInsight Verified Tag
          </p>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 no-print">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Label</span>
          </button>
        </div>
      </div>
    </div>
  );
};
