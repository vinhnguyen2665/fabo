import React, { useState } from 'react';
import { TaxCalculationResultDto } from '@fabo/types';
import { FileText, QrCode, Banknote, Split, Printer, CheckCircle } from 'lucide-react';

export interface TaxInvoiceSummaryProps {
  pricing: TaxCalculationResultDto;
  onOpenVietQr: (eInvoiceInfo?: { taxCode: string; companyName: string; email: string }) => void;
  onPayCash: (eInvoiceInfo?: { taxCode: string; companyName: string; email: string }) => void;
  onPreCheckPrint?: (eInvoiceInfo?: { taxCode: string; companyName: string; email: string }) => void;
  onSplitBill?: () => void;
}

export const TaxInvoiceSummary: React.FC<TaxInvoiceSummaryProps> = ({
  pricing,
  onOpenVietQr,
  onPayCash,
  onPreCheckPrint,
  onSplitBill,
}) => {
  const [eInvoiceRequested, setEInvoiceRequested] = useState<boolean>(false);
  const [buyerTaxCode, setBuyerTaxCode] = useState<string>('');
  const [buyerCompanyName, setBuyerCompanyName] = useState<string>('');
  const [buyerEmail, setBuyerEmail] = useState<string>('');

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const getEInvoiceData = () => {
    if (!eInvoiceRequested || !buyerTaxCode) return undefined;
    return {
      taxCode: buyerTaxCode,
      companyName: buyerCompanyName,
      email: buyerEmail,
    };
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 p-4 w-80 md:w-96">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800 flex justify-between items-center">
        <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
          Bảng Tính Tiền & Thuế GTGT
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
          {pricing.taxMode === 'TAX_INCLUSIVE' ? 'VAT Đã Gồm' : 'VAT Bóc Tách'}
        </span>
      </div>

      {/* Pricing Breakdown Lines */}
      <div className="py-3 space-y-2 text-xs flex-1 overflow-y-auto">
        <div className="flex justify-between text-slate-400">
          <span>Tiền hàng gốc:</span>
          <span className="font-mono font-bold text-white">
            {formatMoney(pricing.rawSubtotal)}
          </span>
        </div>

        {pricing.totalDiscount > 0 && (
          <div className="flex justify-between text-rose-400 font-medium">
            <span>Chiết khấu giảm giá:</span>
            <span className="font-mono">-{formatMoney(pricing.totalDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-400">
          <span>Tiền hàng sau giảm giá:</span>
          <span className="font-mono font-bold text-white">
            {formatMoney(pricing.netSubtotal)}
          </span>
        </div>

        {pricing.serviceChargeAmount > 0 && (
          <div className="flex justify-between text-slate-400">
            <span>Phí phục vụ (5%):</span>
            <span className="font-mono font-semibold text-slate-300">
              +{formatMoney(pricing.serviceChargeAmount)}
            </span>
          </div>
        )}

        {/* VAT Breakdown by rate */}
        <div className="pt-2 border-t border-dashed border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Bóc Tách Thuế GTGT (TT78/2021)
          </span>

          {Object.entries(pricing.taxBreakdownByRate).map(([rate, amount]) => (
            <div key={rate} className="flex justify-between text-slate-400 text-[11px]">
              <span>Thuế suất {rate}:</span>
              <span className="font-mono font-semibold">{formatMoney(Number(amount))}</span>
            </div>
          ))}

          <div className="flex justify-between text-slate-300 font-bold pt-1">
            <span>Tổng tiền thuế GTGT:</span>
            <span className="font-mono text-emerald-400">+{formatMoney(pricing.totalTax)}</span>
          </div>
        </div>

        {/* Final Payment Due */}
        <div className="mt-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide block">
              TỔNG THANH TOÁN
            </span>
            <span className="text-[9px] text-slate-400">
              (Đã gồm phí dịch vụ & VAT)
            </span>
          </div>
          <span className="text-xl font-black font-mono text-emerald-400">
            {formatMoney(pricing.finalAmount)}
          </span>
        </div>

        {/* E-Invoice Toggle (Thông tư 78) */}
        <div className="mt-3 p-3 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
            <input
              type="checkbox"
              checked={eInvoiceRequested}
              onChange={(e) => setEInvoiceRequested(e.target.checked)}
              className="rounded accent-emerald-500"
            />
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Yêu cầu xuất HĐĐT máy tính tiền (TT78)</span>
          </label>

          {eInvoiceRequested && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs animate-in fade-in duration-150">
              <input
                type="text"
                placeholder="Mã số thuế công ty (MST)"
                value={buyerTaxCode}
                onChange={(e) => setBuyerTaxCode(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 font-mono text-white text-xs outline-none"
              />
              <input
                type="text"
                placeholder="Tên công ty / đơn vị nhận hóa đơn"
                value={buyerCompanyName}
                onChange={(e) => setBuyerCompanyName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs outline-none"
              />
              <input
                type="email"
                placeholder="Email nhận HĐĐT (PDF/XML)"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-800 space-y-2">
        {/* Pre-check slip button */}
        {onPreCheckPrint && (
          <button
            type="button"
            onClick={() => onPreCheckPrint(getEInvoiceData())}
            className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>In Tạm Tính (Pre-Check Slip)</span>
          </button>
        )}

        {/* VietQR Dynamic Napas */}
        <button
          type="button"
          onClick={() => onOpenVietQr(getEInvoiceData())}
          className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-98"
        >
          <QrCode className="w-4 h-4" />
          <span>VIETQR NAPAS ĐỘNG</span>
        </button>

        {/* Cash & Split Bill */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onPayCash(getEInvoiceData())}
            className="py-2.5 rounded-xl border border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Banknote className="w-4 h-4 text-emerald-400" />
            <span>Tiền Mặt</span>
          </button>

          {onSplitBill ? (
            <button
              type="button"
              onClick={onSplitBill}
              className="py-2.5 rounded-xl border border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Split className="w-4 h-4 text-blue-400" />
              <span>Tách Bill</span>
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
};
