import React from 'react';
import { DiningTableDto, OrderCartItem, TaxCalculationResultDto, StaffDto } from '@fabo/types';
import { Printer, X, CheckCircle, Receipt } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  isPreCheck?: boolean; // In Tạm Tính vs In Hóa Đơn Chính Thức
  table: DiningTableDto | null;
  cart: OrderCartItem[];
  pricing: TaxCalculationResultDto;
  cashier: StaffDto | null;
  paymentMethod?: 'CASH' | 'VIETQR';
  orderId?: string;
  eInvoiceInfo?: { taxCode: string; companyName: string; email: string };
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  isPreCheck = false,
  table,
  cart,
  pricing,
  cashier,
  paymentMethod = 'CASH',
  orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000),
  eInvoiceInfo,
  onClose,
}) => {
  if (!isOpen) return null;

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Date().toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white text-slate-900 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden flex flex-col border border-slate-200 print:border-none print:shadow-none print:w-full print:max-w-none">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-xs">
              {isPreCheck ? 'Phiếu In Tạm Tính' : 'Hóa Đơn Thanh Toán'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-black flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Ngay</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal Receipt Paper (K80 Standard: 80mm width) */}
        <div id="thermal-receipt" className="p-6 font-mono text-[11px] leading-relaxed max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-2">
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <h2 className="font-extrabold text-sm uppercase tracking-wider">FABO RESTAURANT CLOUD</h2>
            <p className="text-[10px] text-slate-600">Đ/C: Tầng B1, TTTM Landmark 81, Bình Thạnh, TP.HCM</p>
            <p className="text-[10px] text-slate-600">Hotline: 1900 6868 • MST: 0316888999</p>
            
            <div className="my-2.5 inline-block border-2 border-slate-800 px-3 py-0.5 font-black text-xs uppercase tracking-tight">
              {isPreCheck ? 'PHIẾU TẠM TÍNH' : 'HÓA ĐƠN THANH TOÁN'}
            </div>
            
            <div className="text-[10px] text-slate-600 space-y-0.5">
              <div className="flex justify-between">
                <span>Số phiếu: <strong>#{orderId}</strong></span>
                <span>Bàn: <strong>{table?.tableName || 'Mang về'}</strong></span>
              </div>
              <div className="flex justify-between">
                <span>Thu ngân: {cashier?.fullName || 'Thu ngân'}</span>
                <span>Giờ: {currentDateStr}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between font-bold pb-1.5 border-b border-slate-200 text-[10px] text-slate-700">
              <span className="w-1/2">Tên món</span>
              <span className="w-10 text-center">SL</span>
              <span className="w-16 text-right">Đơn giá</span>
              <span className="w-16 text-right">T.Tiền</span>
            </div>

            <div className="space-y-1.5 pt-1.5">
              {cart.map((it, idx) => (
                <div key={idx} className="text-slate-800">
                  <div className="flex justify-between font-semibold">
                    <span className="w-1/2 truncate">{it.itemName}</span>
                    <span className="w-10 text-center font-bold">{it.quantity}</span>
                    <span className="w-16 text-right text-slate-600">{it.unitPrice.toLocaleString()}</span>
                    <span className="w-16 text-right font-bold">{(it.unitPrice * it.quantity).toLocaleString()}</span>
                  </div>
                  {it.selectedModifiers && it.selectedModifiers.length > 0 && (
                    <div className="text-[9px] text-slate-500 pl-2">
                      + {it.selectedModifiers.map((m) => `${m.name} (${m.price.toLocaleString()}đ)`).join(', ')}
                    </div>
                  )}
                  {it.note && (
                    <div className="text-[9px] text-amber-700 italic pl-2">
                      * {it.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Calculations Breakdown */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-slate-700">
            <div className="flex justify-between">
              <span>Tiền hàng:</span>
              <span>{formatMoney(pricing.rawSubtotal)}</span>
            </div>
            {pricing.totalDiscount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Chiết khấu:</span>
                <span>-{formatMoney(pricing.totalDiscount)}</span>
              </div>
            )}
            {pricing.serviceChargeAmount > 0 && (
              <div className="flex justify-between">
                <span>Phí phục vụ (5%):</span>
                <span>+{formatMoney(pricing.serviceChargeAmount)}</span>
              </div>
            )}
            {Object.entries(pricing.taxBreakdownByRate).map(([rate, amt]) => (
              <div key={rate} className="flex justify-between text-[10px] text-slate-500">
                <span>Thuế GTGT ({rate}):</span>
                <span>+{formatMoney(Number(amt))}</span>
              </div>
            ))}

            <div className="flex justify-between text-xs font-black text-slate-900 pt-1.5 border-t border-slate-200">
              <span className="uppercase">TỔNG CỘNG:</span>
              <span className="text-sm font-black">{formatMoney(pricing.finalAmount)}</span>
            </div>
            
            <div className="flex justify-between text-[10px] text-slate-600 pt-0.5">
              <span>Phương thức:</span>
              <span className="font-bold">{paymentMethod === 'VIETQR' ? 'Chuyển khoản VietQR' : 'Tiền mặt'}</span>
            </div>
          </div>

          {/* E-Invoice details if present */}
          {eInvoiceInfo && eInvoiceInfo.taxCode && (
            <div className="py-2 border-b border-dashed border-slate-300 text-[10px] text-slate-600 space-y-0.5">
              <p className="font-bold">THÔNG TIN HÓA ĐƠN ĐIỆN TỬ (TT78):</p>
              <p>MST: <strong>{eInvoiceInfo.taxCode}</strong></p>
              <p>Đơn vị: {eInvoiceInfo.companyName}</p>
              <p>Email nhận: {eInvoiceInfo.email}</p>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-3 text-center text-[10px] text-slate-500 space-y-1">
            <p className="font-semibold italic">Cảm ơn Quý Khách & Hẹn Gặp Lại!</p>
            <p className="text-[9px]">Giá đã bao gồm thuế GTGT theo luật định</p>
            <p className="text-[8px] text-slate-400">Hệ thống Fabo POS Cloud F&B</p>
          </div>
        </div>

        {/* Bottom footer button for screen view */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Phiếu K80</span>
          </button>
        </div>
      </div>
    </div>
  );
};
