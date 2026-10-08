import React, { useState, useEffect } from 'react';
import { 
  DiningTableDto, MenuItemDto, OrderCartItem, 
  TaxCalculationResultDto, VietQrDataDto, 
  CashierSessionDto, StaffDto, TableLayoutDto, CreateTableRequestDto 
} from '@fabo/types';
import { TableMap } from './components/TableMap';
import { OrderDrawer } from './components/OrderDrawer';
import { TaxInvoiceSummary } from './components/TaxInvoiceSummary';
import { VietQrModal } from './components/VietQrModal';
import { CashierLoginModal } from './components/CashierLoginModal';
import { ShiftCloseModal } from './components/ShiftCloseModal';
import { ReceiptModal } from './components/ReceiptModal';
import { useFaboSocket } from '@fabo/websocket';
import { 
  LayoutGrid, UtensilsCrossed, Receipt, Shield, 
  Lock, LogOut, Calculator, RefreshCw, Send, Bell, Loader2 
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'TABLES' | 'ORDER' | 'CHECKOUT'>('TABLES');
  
  // Real database states
  const [tables, setTables] = useState<DiningTableDto[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
  const [selectedTable, setSelectedTable] = useState<DiningTableDto | null>(null);
  const [cart, setCart] = useState<OrderCartItem[]>([]);
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Staff & Shift Session state
  const [session, setSession] = useState<CashierSessionDto | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(true);
  const [isShiftCloseOpen, setIsShiftCloseOpen] = useState<boolean>(false);
  const [cashSales, setCashSales] = useState<number>(0);
  const [qrSales, setQrSales] = useState<number>(0);
  const [orderCount, setOrderCount] = useState<number>(0);

  // VietQR & Receipt state
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [qrData, setQrData] = useState<VietQrDataDto | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [receiptPreCheck, setReceiptPreCheck] = useState<boolean>(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<'CASH' | 'VIETQR'>('CASH');
  const [currentEInvoiceInfo, setCurrentEInvoiceInfo] = useState<{ taxCode: string; companyName: string; email: string } | undefined>();
  const [kitchenAlert, setKitchenAlert] = useState<string | null>(null);
  const [isSendingToKitchen, setIsSendingToKitchen] = useState<boolean>(false);

  const { subscribe } = useFaboSocket({
    enabled: true,
  });

  useEffect(() => {
    const unsub = subscribe<any>('/topic/branch/B01/waiter', (data) => {
      if (data && (data.type === 'CALL_WAITER' || data.event === 'ORDER_READY_FOR_PICKUP')) {
        setKitchenAlert(data.message || `Món ăn cho ${data.tableName} đã sẵn sàng! Mời phục vụ bưng món.`);
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
          osc.start();
          osc.stop(ctx.currentTime + 0.8);
        } catch (_) {}
      }
    });

    return () => unsub();
  }, [subscribe]);

  // Fetch Tables & Menu from Backend Microservices
  const fetchTables = async () => {
    try {
      const res = await fetch('/api/v1/pos/tables');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.body ?? []);
        setTables(list);
      }
    } catch (err) {
      console.warn('Backend /api/v1/pos/tables fetch error, retaining current tables');
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/v1/pos/menu');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.body ?? []);
        setMenuItems(list);
      }
    } catch (err) {
      console.warn('Backend /api/v1/pos/menu fetch error, retaining current menu');
    }
  };

  useEffect(() => {
    setIsLoadingData(true);
    Promise.all([fetchTables(), fetchMenu()]).finally(() => setIsLoadingData(false));
  }, []);

  // Compute pricing
  const rawSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const netSubtotal = Math.max(0, rawSubtotal - orderDiscount);
  const serviceCharge = Math.round(netSubtotal * 0.05); // 5% service charge
  const vat8 = Math.round(cart.filter((c) => c.taxRate === 0.08).reduce((s, c) => s + c.unitPrice * c.quantity, 0) * 0.08);
  const vat10 = Math.round(cart.filter((c) => c.taxRate === 0.10).reduce((s, c) => s + c.unitPrice * c.quantity, 0) * 0.10);
  const totalTax = vat8 + vat10;
  const finalAmount = netSubtotal + serviceCharge + totalTax;

  const pricing: TaxCalculationResultDto = {
    taxMode: 'TAX_EXCLUSIVE',
    rawSubtotal,
    totalDiscount: orderDiscount,
    netSubtotal,
    serviceChargeAmount: serviceCharge,
    totalTax,
    taxBreakdownByRate: { '8%': vat8, '10%': vat10 },
    finalAmount,
  };

  // Select Table & load active order from backend
  const handleSelectTable = async (table: DiningTableDto) => {
    setSelectedTable(table);
    setActiveTab('ORDER');

    if (table.status === 'OCCUPIED' && table.activeOrderId) {
      try {
        const res = await fetch(`/api/v1/pos/tables/${table.id}/order`);
        if (res.ok) {
          const raw = await res.json();
          const orderData = raw.body ?? raw;
          if (orderData.items && orderData.items.length > 0) {
            setCart(orderData.items);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not load table active order from backend');
      }
    }
    // If table is EMPTY or no order items
    setCart([]);
  };

  // Add Item to Cart
  const handleAddToCart = (item: MenuItemDto, options: any[] = [], note: string = '') => {
    const extra = options.reduce((sum, opt) => sum + opt.extraPrice, 0);
    setCart((prev) => [
      ...prev,
      {
        id: 'cart-' + Date.now() + Math.random().toString(36).substring(2, 6),
        menuItemId: item.id,
        itemName: item.name,
        unitPrice: item.price + extra,
        quantity: 1,
        taxRate: item.taxRate,
        selectedModifiers: options,
        note,
      },
    ]);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((it) => (it.id === id ? { ...it, quantity: it.quantity + delta } : it))
        .filter((it) => it.quantity > 0)
    );
  };

  const handleUpdateCartItemNote = (cartItemId: string, note: string) => {
    setCart((prev) =>
      prev.map((it) => (it.id === cartItemId ? { ...it, note } : it))
    );
  };

  // Send Order to Kitchen (KDS) & Save active order
  const handleSendOrderToKitchen = async () => {
    if (isSendingToKitchen) return;

    if (!selectedTable) {
      alert('Vui lòng chọn bàn trước khi gửi bếp!');
      return;
    }
    if (cart.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    setIsSendingToKitchen(true);

    try {
      const orderPayload = {
        orderId: selectedTable.activeOrderId || undefined,
        tableId: selectedTable.id,
        tableName: selectedTable.tableName,
        branchId: selectedTable.branchId || 'B01',
        staffId: session?.staff.id || 'usr-01',
        items: cart.map((it) => {
          const modText =
            it.selectedModifiers && it.selectedModifiers.length > 0
              ? it.selectedModifiers
                  .map((m: any) => m.name + (m.price || m.extraPrice ? ` (+${(m.price || m.extraPrice).toLocaleString()}₫)` : ''))
                  .join(', ')
              : (it.modifiersText || '');
          return {
            id: it.id && it.id.startsWith('ITEM-') ? it.id : undefined,
            menuItemId: it.menuItemId,
            itemName: it.itemName,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            taxRate: it.taxRate,
            note: it.note || '',
            modifiersText: modText,
            modifiersJson: modText,
            selectedModifiers: it.selectedModifiers || [],
          };
        }),
        totalAmount: finalAmount,
      };

      const res = await fetch('/api/v1/pos/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        const raw = await res.json();
        const savedOrder = raw.body ?? raw;
        const assignedOrderId = savedOrder.id || savedOrder.orderId || selectedTable.activeOrderId;

        setSelectedTable((prev) =>
          prev ? { ...prev, status: 'OCCUPIED', activeOrderId: assignedOrderId } : null
        );
        setTables((prev) =>
          prev.map((t) =>
            t.id === selectedTable.id
              ? { ...t, status: 'OCCUPIED', activeOrderId: assignedOrderId }
              : t
          )
        );

        if (savedOrder.items && Array.isArray(savedOrder.items)) {
          setCart(
            savedOrder.items.map((it: any) => ({
              id: it.id,
              menuItemId: it.menuItemId,
              itemName: it.itemName,
              unitPrice: it.unitPrice,
              quantity: it.quantity,
              taxRate: it.taxRate,
              selectedModifiers: [],
              modifiersText: it.modifiersJson,
              note: it.note,
            }))
          );
        }

        await fetchTables();
        alert(`Đã gửi đơn #${assignedOrderId} xuống bếp KDS thành công!`);
      } else {
        alert('Gửi đơn sang KDS thất bại. Vui lòng kiểm tra lại kết nối!');
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi gửi đơn sang KDS!');
    } finally {
      setIsSendingToKitchen(false);
    }
  };

  // Floor Plan Layout Saving (RBAC STORE_MANAGER/ADMIN)
  const handleSaveLayout = async (updatedLayouts: TableLayoutDto[]) => {
    const res = await fetch('/api/v1/pos/tables/layout', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedLayouts),
    });
    if (res.ok) {
      await fetchTables();
      alert('Đã lưu sơ đồ mặt bằng 2D thành công!');
    } else {
      throw new Error('Save layout failed');
    }
  };

  // Transfer Table
  const handleTransferTable = async (sourceTableId: string, targetTableId: string) => {
    const res = await fetch('/api/v1/pos/tables/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceTableId,
        targetTableId,
        staffId: session?.staff.id,
      }),
    });
    if (res.ok) {
      await fetchTables();
      alert('Chuyển bàn thành công!');
    } else {
      // Local fallback
      setTables((prev) => {
        const src = prev.find((t) => t.id === sourceTableId);
        return prev.map((t) => {
          if (t.id === sourceTableId) return { ...t, status: 'EMPTY', activeOrderId: undefined };
          if (t.id === targetTableId) return { ...t, status: 'OCCUPIED', activeOrderId: src?.activeOrderId || 'ORD-TRF' };
          return t;
        });
      });
      alert('Chuyển bàn thành công!');
    }
  };

  // Merge Table
  const handleMergeTable = async (sourceTableId: string, targetTableId: string) => {
    const res = await fetch('/api/v1/pos/tables/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceTableId,
        targetTableId,
        staffId: session?.staff.id,
      }),
    });
    if (res.ok) {
      await fetchTables();
      alert('Gộp bàn thành công!');
    } else {
      // Local fallback
      setTables((prev) =>
        prev.map((t) => (t.id === sourceTableId ? { ...t, status: 'EMPTY', activeOrderId: undefined } : t))
      );
      alert('Gộp bàn thành công!');
    }
  };

  // Add Table
  const handleAddTable = async (newTable: CreateTableRequestDto) => {
    const res = await fetch('/api/v1/pos/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTable),
    });
    if (res.ok) {
      await fetchTables();
      alert(`Đã thêm bàn ${newTable.tableName} thành công!`);
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Lỗi khi thêm bàn mới');
      throw new Error('Add table failed');
    }
  };

  // Delete Table
  const handleDeleteTable = async (tableId: string) => {
    const res = await fetch(`/api/v1/pos/tables/${tableId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      if (selectedTable?.id === tableId) {
        setSelectedTable(null);
      }
      await fetchTables();
      alert('Đã xóa bàn thành công!');
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Lỗi khi xóa bàn');
      throw new Error('Delete table failed');
    }
  };

  // Pre-check Print Slip (In Tạm Tính)
  const handlePreCheckPrint = (eInvoiceInfo?: any) => {
    if (cart.length === 0) {
      alert('Đơn hàng chưa có món để in tạm tính!');
      return;
    }
    setCurrentEInvoiceInfo(eInvoiceInfo);
    setReceiptPreCheck(true);
    setIsReceiptModalOpen(true);
  };

  // Cash Payment
  const handlePayCash = async (eInvoiceInfo?: any) => {
    if (cart.length === 0) {
      alert('Đơn hàng chưa có món để thanh toán!');
      return;
    }
    const orderId = selectedTable?.activeOrderId || 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    
    // Call pay invoice endpoint
    try {
      await fetch(`/api/v1/pos/invoices/${orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'CASH',
          amount: finalAmount,
          staffId: session?.staff.id,
          eInvoiceInfo,
        }),
      });
    } catch (_) {}

    // Update shift totals
    setCashSales((prev) => prev + finalAmount);
    setOrderCount((prev) => prev + 1);

    // Open receipt modal for thermal printing
    setCurrentPaymentMethod('CASH');
    setCurrentEInvoiceInfo(eInvoiceInfo);
    setReceiptPreCheck(false);
    setIsReceiptModalOpen(true);

    // Transition table to CLEANING
    if (selectedTable) {
      setTables((prev) =>
        prev.map((t) => (t.id === selectedTable.id ? { ...t, status: 'CLEANING', activeOrderId: undefined } : t))
      );
    }
    setCart([]);
  };

  // Open VietQR Modal
  const handleOpenVietQr = (eInvoiceInfo?: any) => {
    if (cart.length === 0) {
      alert('Đơn hàng chưa có món!');
      return;
    }
    const orderId = selectedTable?.activeOrderId || 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    setCurrentEInvoiceInfo(eInvoiceInfo);
    setQrData({
      qrRawPayload: '00020101021238570010A00000072701270006970403011300110123456780208QRIBFTTA530370454061800005802VN62340107NPS68690819thanh toan don hang63042E2E',
      qrBase64Image: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=VIETQR_DEMO_' + orderId,
      crc: '2E2E',
      amount: finalAmount,
      bnbBin: '970403 (Sacombank)',
      consumerId: '0011012345678',
      purpose: 'FABO ' + orderId,
      billNumber: orderId,
    });
    setIsQrModalOpen(true);
  };

  // On VietQR Success
  const handleVietQrPaymentSuccess = async (paidOrderId: string) => {
    try {
      await fetch(`/api/v1/pos/invoices/${paidOrderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'VIETQR',
          amount: finalAmount,
          staffId: session?.staff.id,
          eInvoiceInfo: currentEInvoiceInfo,
        }),
      });
    } catch (_) {}

    setQrSales((prev) => prev + finalAmount);
    setOrderCount((prev) => prev + 1);

    setIsQrModalOpen(false);
    setCurrentPaymentMethod('VIETQR');
    setReceiptPreCheck(false);
    setIsReceiptModalOpen(true);

    if (selectedTable) {
      setTables((prev) =>
        prev.map((t) => (t.id === selectedTable.id ? { ...t, status: 'CLEANING', activeOrderId: undefined } : t))
      );
    }
    setCart([]);
  };

  // Close shift callback
  const handleCloseShift = (summary: any) => {
    alert(`Đã hoàn tất kết ca #${summary.shiftId}! Tổng doanh thu: ${(summary.totalSales).toLocaleString()}đ. Chênh lệch két: ${(summary.variance).toLocaleString()}đ`);
    setIsShiftCloseOpen(false);
    setSession(null);
    setCashSales(0);
    setQrSales(0);
    setOrderCount(0);
    setIsLoginModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Top Navbar */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 font-black text-slate-950 text-lg shadow-lg shadow-emerald-500/20">
            F
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-2">
              FABO POS CLOUD <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">LIVE DB</span>
            </h1>
            <span className="text-[11px] text-slate-400">Chi nhánh 01 - Landmark 81</span>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('TABLES')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'TABLES' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Sơ Đồ Bàn ({tables.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ORDER')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'ORDER' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Thực Đơn & Giỏ Hàng {cart.length > 0 && `(${cart.length})`}</span>
          </button>
          <button
            onClick={() => setActiveTab('CHECKOUT')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'CHECKOUT' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Thanh Toán & HĐĐT</span>
          </button>
        </div>

        {/* Staff & Shift Controls */}
        <div className="flex items-center gap-2">
          {session ? (
            <>
              {/* Cashier Badge */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-none">
                    {session.staff.fullName}
                  </div>
                  <div className="text-[9px] text-emerald-400 font-mono mt-0.5">
                    {session.staff.role === 'STORE_MANAGER' ? 'Quản lý' : session.staff.role === 'CASHIER' ? 'Thu ngân' : 'Phục vụ'}
                  </div>
                </div>
              </div>

              {/* Close Shift (Z-Report) */}
              <button
                onClick={() => setIsShiftCloseOpen(true)}
                title="Bàn giao ca / Kết ca Z-Report"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-bold transition"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Kết Ca</span>
              </button>

              {/* Lock POS Button */}
              <button
                onClick={() => setIsLoginModalOpen(true)}
                title="Khóa POS (Mở lại bằng PIN)"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Đăng Nhập PIN</span>
            </button>
          )}

          {/* Refresh Data */}
          <button
            onClick={() => {
              fetchTables();
              fetchMenu();
            }}
            title="Làm mới dữ liệu từ Database"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Workstation Layout */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'TABLES' && (
          <div className="flex-1 h-full">
            <TableMap
              tables={tables}
              selectedTable={selectedTable}
              currentUserRole={session?.staff.role || 'CASHIER'}
              onSelectTable={handleSelectTable}
              onSaveLayout={handleSaveLayout}
              onTransferTable={handleTransferTable}
              onMergeTable={handleMergeTable}
              onAddTable={handleAddTable}
              onDeleteTable={handleDeleteTable}
            />
          </div>
        )}

        {activeTab === 'ORDER' && (
          <div className="flex-1 flex h-full">
            <div className="flex-1 flex flex-col h-full">
              {/* Sub-bar for order actions */}
              <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Bàn hiện tại: <strong className="text-emerald-400">{selectedTable?.tableName || 'Chưa chọn bàn'}</strong>
                </span>
                <button
                  onClick={handleSendOrderToKitchen}
                  disabled={cart.length === 0 || isSendingToKitchen}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                >
                  {isSendingToKitchen ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang gửi bếp...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Báo Bếp KDS</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <OrderDrawer
                  tableName={selectedTable?.tableName || ''}
                  menuItems={menuItems}
                  cart={cart}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onUpdateCartItemNote={handleUpdateCartItemNote}
                  onRemoveItem={(id) => setCart((p) => p.filter((x) => x.id !== id))}
                  onClearCart={() => setCart([])}
                  orderDiscount={orderDiscount}
                  onSetDiscount={setOrderDiscount}
                />
              </div>
            </div>

            <TaxInvoiceSummary
              pricing={pricing}
              onOpenVietQr={handleOpenVietQr}
              onPayCash={handlePayCash}
              onPreCheckPrint={handlePreCheckPrint}
              onSplitBill={() => alert('Mở giao diện tách bill nâng cao')}
            />
          </div>
        )}

        {activeTab === 'CHECKOUT' && (
          <div className="flex-1 flex justify-center items-center p-6 bg-slate-950">
            <TaxInvoiceSummary
              pricing={pricing}
              onOpenVietQr={handleOpenVietQr}
              onPayCash={handlePayCash}
              onPreCheckPrint={handlePreCheckPrint}
              onSplitBill={() => alert('Mở giao diện tách bill nâng cao')}
            />
          </div>
        )}
      </main>

      {/* PIN Login & Unlock Modal */}
      <CashierLoginModal
        isOpen={isLoginModalOpen}
        currentStaff={session?.staff}
        onSuccess={(newSession) => {
          setSession(newSession);
          setIsLoginModalOpen(false);
        }}
        onCancel={session ? () => setIsLoginModalOpen(false) : undefined}
      />

      {/* Shift Close Z-Report Modal */}
      <ShiftCloseModal
        isOpen={isShiftCloseOpen}
        session={session}
        cashSales={cashSales}
        qrSales={qrSales}
        orderCount={orderCount}
        onCloseShift={handleCloseShift}
        onCancel={() => setIsShiftCloseOpen(false)}
      />

      {/* Thermal Receipt Print Modal (K80 / K58) */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        isPreCheck={receiptPreCheck}
        table={selectedTable}
        cart={cart}
        pricing={pricing}
        cashier={session?.staff || null}
        paymentMethod={currentPaymentMethod}
        eInvoiceInfo={currentEInvoiceInfo}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      {/* Dynamic VietQR Modal */}
      <VietQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        qrData={qrData}
        onPaymentSuccess={handleVietQrPaymentSuccess}
      />

      {/* Floating Kitchen Ready Alert Banner */}
      {kitchenAlert && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-slate-950 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border-2 border-emerald-400">
          <Bell className="w-5 h-5 animate-spin" />
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-emerald-950">Bếp gọi bưng món</div>
            <div className="font-bold text-sm leading-tight">{kitchenAlert}</div>
          </div>
          <button
            onClick={() => setKitchenAlert(null)}
            className="ml-3 bg-slate-950/20 hover:bg-slate-950/40 rounded-lg p-1.5 text-xs font-bold transition"
            title="Đóng thông báo"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
