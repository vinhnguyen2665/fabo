import React, { useState, useEffect } from 'react';
import { MenuItemDto, OrderCartItem } from '@fabo/types';
import { QrCode, ShoppingBag, Plus, Minus, CheckCircle, ChevronRight, Utensils, RefreshCw } from 'lucide-react';

const FALLBACK_MENU_ITEMS: MenuItemDto[] = [
  { id: 'M1', name: 'Phở Bò Tái Nạm Đặc Biệt', price: 65000, taxRate: 0.08, category: 'Món Chính', isAvailable: true },
  { id: 'M2', name: 'Bún Chả Hà Nội Cổ Truyền', price: 60000, taxRate: 0.08, category: 'Món Chính', isAvailable: true },
  { id: 'M3', name: 'Cơm Rang Dưa Bò', price: 55000, taxRate: 0.08, category: 'Món Chính', isAvailable: true },
  { id: 'M4', name: 'Cà Phê Muối Xứ Huế', price: 35000, taxRate: 0.10, category: 'Đồ Uống', isAvailable: true },
  { id: 'M5', name: 'Trà Đào Cam Sả', price: 42000, taxRate: 0.10, category: 'Đồ Uống', isAvailable: true },
];

export function App() {
  const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
  const [tableInfo, setTableInfo] = useState({ tableId: 'T02', tableName: 'Bàn 02', branchName: 'Fabo Landmark 81' });
  const [cart, setCart] = useState<OrderCartItem[]>([]);
  const [isOrdered, setIsOrdered] = useState<boolean>(false);
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Parse URL params for table ID / name
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table') || params.get('tableId');
    if (tableParam) {
      setTableInfo({
        tableId: tableParam,
        tableName: `Bàn ${tableParam.replace(/\D/g, '') || tableParam}`,
        branchName: 'Fabo Landmark 81',
      });
    }

    // Fetch menu from pos-service
    fetch('/api/v1/pos/menu')
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data: MenuItemDto[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setMenuItems(data);
        } else {
          setMenuItems(FALLBACK_MENU_ITEMS);
        }
      })
      .catch(() => {
        setMenuItems(FALLBACK_MENU_ITEMS);
      });
  }, []);

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

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) =>
      prev
        .map((it) => (it.menuItemId === menuItemId ? { ...it, quantity: it.quantity - 1 } : it))
        .filter((it) => it.quantity > 0)
    );
  };

  const totalAmount = cart.reduce((s, it) => s + it.unitPrice * it.quantity, 0);

  const handleSendOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/v1/pos/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: tableInfo.tableId,
          tableName: tableInfo.tableName,
          branchId: 'B01',
          items: cart,
          totalAmount,
        }),
      });
    } catch (_) {}
    setIsSubmitting(false);
    setIsOrdered(true);
  };

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
              Bếp đang chuẩn bị món cho quý khách. Bạn có thể thanh toán trước qua mã VietQR hoặc thanh toán khi ra về tại quầy thu ngân.
            </p>
            <button
              onClick={() => setShowPayModal(true)}
              className="mt-6 w-full py-3 rounded-2xl bg-emerald-500 font-black text-sm text-slate-950 shadow-lg shadow-emerald-500/20"
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
              {menuItems.map((item) => {
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
                            onClick={() => removeFromCart(item.id)}
                            className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-sm"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-xs px-1">{inCart.quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 border border-slate-700"
                        >
                          + Thêm
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

      {/* Floating Bottom Cart Bar */}
      {!isOrdered && cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 z-30">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="text-slate-400">
              Tổng cộng ({cart.reduce((s, it) => s + it.quantity, 0)} món):
            </span>
            <span className="text-base font-black text-emerald-400 font-mono">
              {formatMoney(totalAmount)}
            </span>
          </div>

          <button
            onClick={handleSendOrder}
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang gửi...' : 'Gửi Đơn Cho Bếp'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VietQR Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xs w-full p-6 text-center space-y-4">
            <h3 className="font-extrabold text-base text-white">Quét VietQR Thanh Toán</h3>
            <p className="text-xs text-slate-400 font-mono">
              Số tiền: <strong className="text-emerald-400">{formatMoney(totalAmount)}</strong>
            </p>
            <div className="bg-white p-3 rounded-2xl inline-block shadow-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VIETQR_${tableInfo.tableId}_${totalAmount}`}
                alt="VietQR"
                className="w-44 h-44 mx-auto"
              />
            </div>
            <p className="text-[11px] text-slate-500">Mở app Ngân hàng quét để thanh toán tự động</p>
            <button
              onClick={() => setShowPayModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
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
