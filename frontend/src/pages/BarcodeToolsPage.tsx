import React, { useState, useRef, useEffect } from 'react';
import { Barcode, QrCode, Printer, Download, Copy, Check, Sparkles } from 'lucide-react';
import JsBarcode from 'jsbarcode';

export const BarcodeToolsPage: React.FC = () => {
  const [codeValue, setCodeValue] = useState('8901052001015');
  const [labelTitle, setLabelTitle] = useState('Tata Tea Premium 500g');
  const [price, setPrice] = useState('275.00');
  const [format, setFormat] = useState<'CODE128' | 'EAN13'>('CODE128');
  const [sheetCount, setSheetCount] = useState(6);
  const [copied, setCopied] = useState(false);

  const singleSvgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (singleSvgRef.current && codeValue.trim()) {
      try {
        JsBarcode(singleSvgRef.current, codeValue.trim(), {
          format,
          lineColor: '#000000',
          width: 2,
          height: 60,
          displayValue: true,
          font: 'monospace',
          fontSize: 13,
          margin: 10,
        });
      } catch (err) {
        console.error('Barcode preview render error:', err);
      }
    }
  }, [codeValue, format]);

  const handlePrintSheet = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Barcode className="w-6 h-6 text-blue-400" />
            <span>Barcode & Packaging Label Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate Code128 and EAN-13 barcodes with printable multi-label sticker sheets.
          </p>
        </div>

        <button
          onClick={handlePrintSheet}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95 no-print"
        >
          <Printer className="w-4 h-4" />
          <span>Print Sticker Sheet</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
        {/* Generator Controls (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
          <h3 className="font-bold text-white text-sm">Barcode Parameters</h3>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Barcode Value / SKU</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={codeValue}
                onChange={(e) => setCodeValue(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
              <button
                onClick={handleCopy}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
                title="Copy Value"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Label Product Title</label>
            <input
              type="text"
              value={labelTitle}
              onChange={(e) => setLabelTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Price (₹)</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Barcode Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
              >
                <option value="CODE128">Code 128 (Universal)</option>
                <option value="EAN13">EAN-13 (Standard Retail)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Stickers on Sheet</label>
            <input
              type="number"
              min={1}
              max={24}
              value={sheetCount}
              onChange={(e) => setSheetCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
            />
          </div>

          {/* Quick barcode generator helpers */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Quick Generators
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  let c = '890';
                  for (let i = 0; i < 9; i++) c += Math.floor(Math.random() * 10);
                  let sum = 0;
                  for (let i = 0; i < 12; i++) {
                    const d = parseInt(c[i], 10);
                    sum += i % 2 === 0 ? d : d * 3;
                  }
                  const check = (10 - (sum % 10)) % 10;
                  setCodeValue(c + check);
                  setFormat('EAN13');
                }}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-semibold"
              >
                Generate EAN-13
              </button>
              <button
                type="button"
                onClick={() => {
                  setCodeValue('PRD-' + Math.floor(100000 + Math.random() * 900000));
                  setFormat('CODE128');
                }}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-semibold"
              >
                Generate Code128
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
          <h3 className="font-bold text-white text-sm mb-4">Single Sticker Preview</h3>

          <div className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-300 shadow-xl max-w-sm w-full flex flex-col items-center justify-center text-center">
            <p className="font-extrabold text-sm text-slate-900">{labelTitle}</p>
            <p className="font-mono text-xs text-slate-600 font-bold mt-0.5">MRP: ₹{price}</p>
            <div className="my-2">
              <svg ref={singleSvgRef} className="max-w-full"></svg>
            </div>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">
              RetailInsight Certified Barcode
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Sticker Sheet Preview & Print Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>Printable Label Sheet ({sheetCount} stickers)</span>
        </h3>

        <div id="printable-receipt" className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-white p-6 rounded-xl text-slate-900">
          {Array.from({ length: sheetCount }).map((_, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-300 flex flex-col items-center justify-center text-center bg-slate-50 shadow-sm"
            >
              <p className="font-bold text-xs text-slate-900 truncate max-w-full">{labelTitle}</p>
              <p className="font-mono text-[11px] text-slate-700 font-bold">MRP: ₹{price}</p>
              <div className="my-1">
                <svg
                  ref={(el) => {
                    if (el && codeValue.trim()) {
                      try {
                        JsBarcode(el, codeValue.trim(), {
                          format,
                          lineColor: '#000000',
                          width: 1.5,
                          height: 40,
                          displayValue: true,
                          fontSize: 11,
                          margin: 5,
                        });
                      } catch {}
                    }
                  }}
                  className="max-w-full"
                ></svg>
              </div>
              <p className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">
                RetailInsight Tag
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
