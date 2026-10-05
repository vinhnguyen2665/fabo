import React, { useState } from 'react';
import { MenuItemDto, OrderCartItem } from '@fabo/types';
import { QrCode, ShoppingBag, Plus, Minus, CheckCircle, ChevronRight, Utensils } from 'lucide-react';

const MENU_ITEMS: MenuItemDto[] = [
  { id: 'M1', name: 'Phở Bò Tái Nạm Đặc Biệt', price: 65000, taxRate: 0.08, category: 'Món Chính', isAvailable: true },
  { id: 'M2', name: 'Bún Chả Hà Nội Cổ Truyền', price: 60000, taxRate: 0.08, category: 'Món Chính', isAvailable: true },
  { id: 'M3', name: 'Cơm Rang Dưa Bò', price: 55000, taxRate: 0.08, category: 'Món Chính', isAvailable: true },
  { id: 'M4', name: 'Cà Phê Muối Xứ Huế', price: 35000, taxRate: 0.10, category: 'Đồ Uống', isAvailable: true },
  { id: 'M5', name: 'Trà Đào Cam Sả', price: 42000, taxRate: 0.10, category: 'Đồ Uống', isAvailable: true },
];

export function App() {
  const [tableInfo] = useState({ tableName: 'Bàn 02', branchName: 'Fabo Landmark 81' });
  const [cart, setCart] = useState<OrderCartItem[]>([]);
  const [isOrdered, setIsOrdered] = useState<boolean>(false);
  const [showPayModal, setShowPayModal] = useState<boolean>(false);

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const addToCart = (item: MenuItemDto) => {
    setCart((prev) => {
      const existing = prev.find((x) => x.menuItemId === item.id);
      if (existing) {
        return prev.map((x) => (x.menuItemId === item.id ? { ...x, quantity: x.quantity + 1 } : x));
      }
      return [
        ...prev,
        {
          id: 'c-' + Date.now(),
          menuItemId: item.id,
          itemName: item.name,
          unitPrice: item.price,
          quantity: 1,
          taxRate: item.taxRate,
          selectedModifiers: [],
        },
      ];
    });
  };

  const totalAmount = cart.reduce((s, it) => s + it.unitPrice * it.quantity, 0);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      {/* Mobile Top Header */}
      <header className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center sticky top-0 z-20">
        <div>
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
            {tableInfo.branchName}
          </span>
          <h1 className="text-lg font-black text-white">{tableInfo.tableName}</h1>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-slate-300">
          <QrCode className="w-3.5 h-3.5 text-emerald-400" /> Quét bàn thành công
        </div>
      </header>

      {/* Menu List */}
      <main className="flex-1 p-4 space-y-3 pb-24">
        {isOrdered ? (
          <div className="p-8 text-center bg-slate-950 rounded-3xl border border-slate-800 my-8">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-xl font-black text-white">Đã Gửi Đơn Đến Bếp!</h2>
            <p className="text-xs text-slate-400 mt-2">
              Bếp đang chuẩn bị món cho quý khách. Bạn có thể thanh toán trước qua mã VietQR hoặc thanh toán khi ra về.
            </p>
            <button
              onClick={() => setShowPayModal(true)}
              className="mt-6 w-full py-3 rounded-2xl bg-emerald-600 font-bold text-sm text-white shadow-lg shadow-emerald-600/30"
            >
              Thanh Toán VietQR Ngay
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Thực Đơn Gọi Món Tại Bàn
            </h2>
            <div className="space-y-2.5">
              {MENU_ITEMS.map((item) => {
                const inCart = cart.find((x) => x.menuItemId === item.id);
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-white">{item.name}</h3>
                      <span className="text-xs font-black text-emerald-400 block mt-0.5">
                        {formatMoney(item.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {inCart ? (
                        <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-1">
                          <button
                            onClick={() =>
                              setCart((p) =>
                                p
                                  .map((x) => (x.menuItemId === item.id ? { ...x, quantity: x.quantity - 1 } : x))
                                  .filter((x) => x.quantity > 0)
                              )
                            }
                            className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{inCart.quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="h-8 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Thêm
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Floating Cart Bar */}
      {!isOrdered && cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 z-30">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-400 block">{cart.reduce((s, i) => s + i.quantity, 0)} món đã chọn</span>
              <span className="text-lg font-black text-emerald-400">{formatMoney(totalAmount)}</span>
            </div>
            <button
              onClick={() => setIsOrdered(true)}
              className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-extrabold text-sm text-white shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
            >
              <span>Gửi Gọi Món</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Self-checkout VietQR modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl">
            <h3 className="font-extrabold text-white text-base mb-1">Mã VietQR Thanh Toán</h3>
            <p className="text-xs text-slate-400 mb-4">{tableInfo.tableName} • {formatMoney(totalAmount)}</p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VIETQR_DEMO_${totalAmount}`}
              alt="VietQR"
              className="w-52 h-52 mx-auto rounded-2xl bg-white p-2 mb-4"
            />
            <p className="text-[11px] text-emerald-400 font-medium mb-4">
              Mở ứng dụng ngân hàng bất kỳ để quét mã
            </p>
            <button
              onClick={() => setShowPayModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
