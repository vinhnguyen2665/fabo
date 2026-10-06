import React, { useState, useEffect } from 'react';
import { VietQrDataDto } from '@fabo/types';
import { useFaboSocket } from '@fabo/websocket';
import { CheckCircle2, Copy, Clock, RefreshCw, X, Printer, ShieldCheck } from 'lucide-react';

export interface VietQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrData: VietQrDataDto | null;
  onPaymentSuccess?: (orderId: string) => void;
}

export const VietQrModal: React.FC<VietQrModalProps> = ({
  isOpen,
  onClose,
  qrData,
  onPaymentSuccess,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 phút đếm ngược
  const [isPaid, setIsPaid] = useState<boolean>(false);

  const { isConnected, subscribe } = useFaboSocket({
    enabled: isOpen,
    sockJsFallbackUrl: '/ws-kds',
  });

  // Countdown timer
  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(15 * 60);
      setIsPaid(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Subscribe to real-time payment completion
  useEffect(() => {
    if (!isOpen || !qrData?.billNumber || !isConnected) return;

    const unsubscribe = subscribe<{ orderId: string; amount: number; paymentMethod: string }>(
      '/topic/payments/status',
      (event) => {
        if (event.orderId === qrData.billNumber) {
          setIsPaid(true);
          // Play audio notification
          try {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(880, ctx.currentTime); // Note A5
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
          } catch {
            // Audio context fallback
          }

          if (onPaymentSuccess) {
            onPaymentSuccess(event.orderId);
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen, qrData, isConnected, subscribe, onPaymentSuccess]);

  if (!isOpen || !qrData) return null;

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Thanh Toán VietQR Chuyển Nhanh 247
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isPaid ? (
            <div className="flex flex-col items-center py-8 text-center animate-in zoom-in-95 duration-300">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-4">
                <CheckCircle2 className="h-12 w-12 animate-bounce" />
              </div>
              <h4 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                Thanh Toán Thành Công!
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                Đã ghi nhận giao dịch {formatMoney(qrData.amount)} cho đơn hàng #{qrData.billNumber}
              </p>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 font-medium text-white hover:bg-slate-700 transition"
                >
                  <Printer className="h-4 w-4" />
                  In Hóa Đơn K80
                </button>
                <button
                  onClick={onClose}
                  className="rounded-xl border border-gray-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Đóng
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* QR Image Box */}
              <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-xl border border-gray-200 dark:bg-slate-950 dark:border-slate-800">
                <img
                  src={qrData.qrBase64Image}
                  alt="Mã QR VietQR Napas"
                  className="w-56 h-56 rounded-lg object-contain"
                />
                {/* Countdown */}
                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Clock className="h-4 w-4" />
                  <span>Hết hạn trong: {timeFormatted}</span>
                </div>
              </div>

              {/* Transfer Details */}
              <div className="flex-1 w-full space-y-3 text-sm">
                <div>
                  <span className="text-xs text-gray-500 block">Số tiền cần thanh toán</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatMoney(qrData.amount)}
                  </span>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">Mã BIN / Ngân hàng:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{qrData.bnbBin}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">Số tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{qrData.consumerId}</span>
                      <button
                        onClick={() => copyToClipboard(qrData.consumerId, 'acc')}
                        className="text-gray-400 hover:text-emerald-600 p-1"
                        title="Sao chép số tài khoản"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">Nội dung chuyển tiền:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{qrData.purpose}</span>
                      <button
                        onClick={() => copyToClipboard(qrData.purpose, 'purpose')}
                        className="text-gray-400 hover:text-emerald-600 p-1"
                        title="Sao chép nội dung"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {copiedField && (
                  <p className="text-xs text-emerald-600 font-medium text-center">
                    ✓ Đã sao chép vào bộ nhớ tạm
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                    <span>Napas 247 Dynamic QR</span>
                  </div>
                  <span className="font-mono">CRC: {qrData.crc}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t flex items-center justify-between dark:bg-slate-950 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
            <span>Đang lắng nghe biến động số dư qua Webhook IPN...</span>
          </div>
          <button
            onClick={() => setIsPaid(true)}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            [Test: Xác nhận thủ công]
          </button>
        </div>
      </div>
    </div>
  );
};
