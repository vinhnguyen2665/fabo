import React, { useState } from 'react';
import { CashierSessionDto } from '@fabo/types';
import { Calculator, Printer, CheckCircle, AlertTriangle, ArrowRight, X } from 'lucide-react';

interface ShiftCloseModalProps {
  isOpen: boolean;
  session: CashierSessionDto | null;
  cashSales: number;
  qrSales: number;
  orderCount: number;
  onCloseShift: (closingSummary: any) => void;
  onCancel: () => void;
}

export const ShiftCloseModal: React.FC<ShiftCloseModalProps> = ({
  isOpen,
  session,
  cashSales,
  qrSales,
  orderCount,
  onCloseShift,
  onCancel,
}) => {
  const initialCash = session?.initialCash || 0;
  const expectedCash = initialCash + cashSales;
  const [actualCash, setActualCash] = useState<number>(expectedCash);
  const [note, setNote] = useState<string>('');

  const variance = actualCash - expectedCash;

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  if (!isOpen || !session) return null;

  const handlePrintZReport = () => {
    window.print();
  };

  const handleConfirmClose = () => {
    onCloseShift({
      shiftId: session.shiftId,
      staffId: session.staff.id,
      staffName: session.staff.fullName,
      openedAt: session.openedAt,
      closedAt: new Date().toISOString(),
      initialCash,
      cashSales,
      qrSales,
      totalSales: cashSales + qrSales,
      orderCount,
      expectedCash,
      actualCash,
      variance,
      note,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white tracking-tight">
                Bàn Giao & Kết Ca Làm Việc (Z-Report)
              </h2>
              <p className="text-xs text-slate-400">
                Mã ca: #{session.shiftId} • Thu ngân: {session.staff.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
              <span className="text-[11px] text-slate-400 font-semibold block">Tiền đầu ca</span>
              <span className="text-lg font-mono font-bold text-slate-200">
                {formatMoney(initialCash)}
              </span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
              <span className="text-[11px] text-slate-400 font-semibold block">Tổng đơn hoàn thành</span>
              <span className="text-lg font-mono font-bold text-emerald-400">
                {orderCount} đơn hàng
              </span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
              <span className="text-[11px] text-slate-400 font-semibold block">Thu tiền mặt</span>
              <span className="text-lg font-mono font-bold text-emerald-400">
                {formatMoney(cashSales)}
              </span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
              <span className="text-[11px] text-slate-400 font-semibold block">Thu VietQR / Chuyển khoản</span>
              <span className="text-lg font-mono font-bold text-blue-400">
                {formatMoney(qrSales)}
              </span>
            </div>
          </div>

          {/* Cash Drawer Reconciliation */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Tiền mặt dự kiến trong két:</span>
              <span className="font-mono font-bold text-white text-sm">
                {formatMoney(expectedCash)}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Tiền mặt thực tế kiểm đếm:
              </label>
              <input
                type="number"
                step="10000"
                value={actualCash}
                onChange={(e) => setActualCash(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl py-2 px-3 text-right font-mono font-bold text-amber-300 text-lg outline-none"
              />
            </div>

            {/* Variance indicator */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              variance === 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : variance < 0
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
            }`}>
              <div className="flex items-center gap-2">
                {variance === 0 ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span className="font-bold">
                  {variance === 0 ? 'Khớp tiền 100%' : variance < 0 ? 'Hụt tiền mặt két' : 'Thừa tiền mặt két'}
                </span>
              </div>
              <span className="font-mono font-black text-sm">
                {formatMoney(variance)}
              </span>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Ghi chú bàn giao ca:</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú thêm về ca trực, các vấn đề phát sinh..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrintZReport}
            className="flex-1 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>In Phiếu Z-Report</span>
          </button>
          <button
            type="button"
            onClick={handleConfirmClose}
            className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <span>Xác Nhận Kết Ca</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
