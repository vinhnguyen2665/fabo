import React, { useState } from 'react';
import { TaxCalculationResultDto } from '@fabo/types';
import { FileText, QrCode, Banknote, Split, CreditCard, CheckCircle } from 'lucide-react';

export interface TaxInvoiceSummaryProps {
  pricing: TaxCalculationResultDto;
  onOpenVietQr: () => void;
  onPayCash: () => void;
  onSplitBill?: () => void;
}

export const TaxInvoiceSummary: React.FC<TaxInvoiceSummaryProps> = ({
  pricing,
  onOpenVietQr,
  onPayCash,
  onSplitBill,
}) => {
  const [eInvoiceRequested, setEInvoiceRequested] = useState<boolean>(false);
  const [buyerTaxCode, setBuyerTaxCode] = useState<string>('');
  const [buyerCompanyName, setBuyerCompanyName] = useState<string>('');
  const [buyerEmail, setBuyerEmail] = useState<string>('');

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 w-80 md:w-96">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider">
          Bảng Tính Tiền & Thuế GTGT
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {pricing.taxMode === 'TAX_INCLUSIVE' ? 'VAT Đã Gồm' : 'VAT Bóc Tách'}
        </span>
      </div>

      {/* Pricing Breakdown Lines */}
      <div className="py-4 space-y-2.5 text-xs flex-1 overflow-y-auto">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Tiền hàng gốc:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {formatMoney(pricing.rawSubtotal)}
          </span>
        </div>

        {pricing.totalDiscount > 0 && (
          <div className="flex justify-between text-rose-500 font-medium">
            <span>Chiết khấu giảm giá:</span>
            <span>-{formatMoney(pricing.totalDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Tiền hàng sau giảm giá:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {formatMoney(pricing.netSubtotal)}
          </span>
        </div>

        {pricing.serviceChargeAmount > 0 && (
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Phí dịch vụ:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              +{formatMoney(pricing.serviceChargeAmount)}
            </span>
          </div>
        )}

        {/* VAT Breakdown by rate */}
        <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Bóc Tách Thuế GTGT (TT78/2021)
          </span>

          {Object.entries(pricing.taxBreakdownByRate).map(([rate, amount]) => (
            <div key={rate} className="flex justify-between text-slate-500 text-[11px]">
              <span>Thuế suất GTGT {rate}:</span>
              <span className="font-mono font-semibold">{formatMoney(Number(amount))}</span>
            </div>
          ))}

          <div className="flex justify-between text-slate-700 dark:text-slate-300 font-bold pt-1">
            <span>Tổng tiền thuế GTGT:</span>
            <span>+{formatMoney(pricing.totalTax)}</span>
          </div>
        </div>

        {/* Final Payment Due */}
        <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">
              TỔNG THANH TOÁN
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
              (Đã bao gồm thuế và phí)
            </span>
          </div>
          <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">
            {formatMoney(pricing.finalAmount)}
          </span>
        </div>

        {/* E-Invoice Toggle (Thông tư 78) */}
        <div className="mt-4 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-2.5">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={eInvoiceRequested}
              onChange={(e) => setEInvoiceRequested(e.target.checked)}
              className="rounded text-slate-900 focus:ring-0"
            />
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>Yêu cầu xuất HĐĐT máy tính tiền</span>
          </label>

          {eInvoiceRequested && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <input
                type="text"
                placeholder="Mã số thuế doanh nghiệp (MST)"
                value={buyerTaxCode}
                onChange={(e) => setBuyerTaxCode(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono dark:bg-slate-800 dark:border-slate-700 text-xs"
              />
              <input
                type="text"
                placeholder="Tên công ty / đơn vị"
                value={buyerCompanyName}
                onChange={(e) => setBuyerCompanyName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-xs"
              />
              <input
                type="email"
                placeholder="Email nhận hóa đơn điện tử"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={onOpenVietQr}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-98"
        >
          <QrCode className="w-4 h-4" />
          <span>VIETQR NAPAS ĐỘNG</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onPayCash}
            className="py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 font-bold text-xs text-slate-700 dark:border-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5"
          >
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span>Tiền Mặt</span>
          </button>

          {onSplitBill && (
            <button
              onClick={onSplitBill}
              className="py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 font-bold text-xs text-slate-700 dark:border-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5"
            >
              <Split className="w-4 h-4 text-blue-500" />
              <span>Tách Bill</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
