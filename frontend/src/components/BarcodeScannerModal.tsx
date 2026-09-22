import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Keyboard, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setManualCode('');
      // Attempt camera init
      const startScanner = async () => {
        try {
          const html5QrCode = new Html5Qrcode('barcode-reader-viewport');
          scannerRef.current = html5QrCode;
          await html5QrCode.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 250, height: 150 },
            },
            (decodedText) => {
              html5QrCode.stop().then(() => {
                onScanSuccess(decodedText);
                onClose();
              });
            },
            () => {
              // ignore frame misses
            }
          );
          setCameraActive(true);
        } catch (err: any) {
          console.warn('Camera scan not available or permission denied:', err);
          setCameraActive(false);
          setErrorMsg('Camera access is unavailable or denied. Use manual input or quick test items below.');
        }
      };

      // Slight timeout to let DOM render
      const timer = setTimeout(() => {
        startScanner();
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          try {
            if (scannerRef.current.isScanning) {
              scannerRef.current.stop().catch(() => {});
            }
          } catch {}
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
      onScanSuccess(manualCode.trim());
      onClose();
    }
  };

  const handleQuickSelect = (code: string) => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(() => {});
    }
    onScanSuccess(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-card w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Live Barcode & QR Scanner</h3>
            <p className="text-xs text-slate-400">Aim camera at product barcode or type below</p>
          </div>
        </div>

        {/* Video Viewport Container */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 min-h-[220px] flex items-center justify-center">
          <div id="barcode-reader-viewport" className="w-full"></div>
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 text-slate-400">
              <Camera className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-300">Camera preview inactive</p>
              {errorMsg && <p className="text-[11px] text-amber-400/80 mt-1 max-w-xs">{errorMsg}</p>}
            </div>
          )}
        </div>

        {/* Manual Barcode Input Form */}
        <form onSubmit={handleManualSubmit} className="mt-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Keyboard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Type or paste Barcode / SKU (e.g. 8901052001015)..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20"
            >
              Scan
            </button>
          </div>
        </form>

        {/* Quick Demo Test Chips */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Demo Barcode Presets</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { name: 'Tata Tea 500g', code: '8901052001015' },
              { name: 'Fortune Oil 1L', code: '8906007281023' },
              { name: 'Maggi Noodles', code: '8901058852307' },
              { name: 'Dettol 250ml', code: '8901396120018' },
              { name: 'Surf Excel 1kg', code: '8901030381014' },
            ].map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleQuickSelect(item.code)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600/30 hover:border-blue-500/50 border border-slate-700/80 text-[11px] text-slate-300 transition-all font-mono"
              >
                {item.name} ({item.code.substring(item.code.length - 4)})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
