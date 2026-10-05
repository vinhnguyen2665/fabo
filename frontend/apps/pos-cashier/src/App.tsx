import React, { useState } from 'react';
import { DiningTableDto, MenuItemDto, OrderCartItem, TaxCalculationResultDto, VietQrDataDto } from '@fabo/types';
import { TableMap } from './components/TableMap';
import { OrderDrawer } from './components/OrderDrawer';
import { TaxInvoiceSummary } from './components/TaxInvoiceSummary';
import { VietQrModal } from './components/VietQrModal';
import { LayoutGrid, UtensilsCrossed, Receipt, Shield, Bell } from 'lucide-react';

// Sample mock data for interactive POS experience
const INITIAL_TABLES: DiningTableDto[] = [
  { id: 'T01', tableName: 'Bàn 01', areaId: 'A1', areaName: 'Tầng 1 (Máy Lạnh)', branchId: 'B01', status: 'EMPTY', capacity: 4 },
  { id: 'T02', tableName: 'Bàn 02', areaId: 'A1', areaName: 'Tầng 1 (Máy Lạnh)', branchId: 'B01', status: 'OCCUPIED', capacity: 4, activeOrderId: 'ORD-1024' },
  { id: 'T03', tableName: 'Bàn 03', areaId: 'A1', areaName: 'Tầng 1 (Máy Lạnh)', branchId: 'B01', status: 'EMPTY', capacity: 2 },
  { id: 'T04', tableName: 'Bàn 04', areaId: 'A1', areaName: 'Tầng 1 (Máy Lạnh)', branchId: 'B01', status: 'RESERVED', capacity: 6 },
  { id: 'T05', tableName: 'Bàn Sân Vườn 1', areaId: 'A2', areaName: 'Sân Vườn Ngoài Trời', branchId: 'B01', status: 'EMPTY', capacity: 4 },
  { id: 'T06', tableName: 'Bàn Sân Vườn 2', areaId: 'A2', areaName: 'Sân Vườn Ngoài Trời', branchId: 'B01', status: 'CLEANING', capacity: 8 },
  { id: 'T07', tableName: 'VIP 01', areaId: 'A3', areaName: 'Phòng VIP', branchId: 'B01', status: 'EMPTY', capacity: 12 },
];

const SAMPLE_MENU: MenuItemDto[] = [
  {
    id: 'M01',
    name: 'Phở Bò Tái Nạm Đặc Biệt',
    price: 65000,
    taxRate: 0.08,
    category: 'Món Nước',
    isAvailable: true,
    modifiers: [
      {
        id: 'MOD_EGG',
        name: 'Thêm Trứng Chần',
        minSelect: 0,
        maxSelect: 1,
        options: [
          { id: 'OPT_EGG_1', name: '1 Quả Trứng Chần', extraPrice: 10000 },
          { id: 'OPT_QUAY', name: 'Đĩa Quẩy Giòn (3 cái)', extraPrice: 8000 },
        ],
      },
    ],
  },
  { id: 'M02', name: 'Bún Chả Hà Nội Cổ Truyền', price: 60000, taxRate: 0.08, category: 'Món Khô', isAvailable: true },
  { id: 'M03', name: 'Cơm Rang Dưa Bò', price: 55000, taxRate: 0.08, category: 'Cơm & Mì', isAvailable: true },
  { id: 'M04', name: 'Cà Phê Muối Xứ Huế', price: 35000, taxRate: 0.10, category: 'Đồ Uống', isAvailable: true },
  { id: 'M05', name: 'Trà Đào Cam Sả', price: 42000, taxRate: 0.10, category: 'Đồ Uống', isAvailable: true },
  { id: 'M06', name: 'Bia Craft IPA Thủ Công', price: 75000, taxRate: 0.10, category: 'Đồ Uống', isAvailable: true },
];

export function App() {
  const [activeTab, setActiveTab] = useState<'TABLES' | 'ORDER' | 'CHECKOUT'>('TABLES');
  const [tables, setTables] = useState<DiningTableDto[]>(INITIAL_TABLES);
  const [selectedTable, setSelectedTable] = useState<DiningTableDto | null>(INITIAL_TABLES[1]);
  const [cart, setCart] = useState<OrderCartItem[]>([
    {
      id: 'c1',
      menuItemId: 'M01',
      itemName: 'Phở Bò Tái Nạm Đặc Biệt',
      unitPrice: 65000,
      quantity: 2,
      taxRate: 0.08,
      selectedModifiers: [{ groupId: 'MOD_EGG', optionId: 'OPT_EGG_1', name: '1 Quả Trứng Chần', price: 10000 }],
      note: 'Ít bánh phở, nước trong',
    },
    {
      id: 'c2',
      menuItemId: 'M04',
      itemName: 'Cà Phê Muối Xứ Huế',
      unitPrice: 35000,
      quantity: 2,
      taxRate: 0.10,
      selectedModifiers: [],
    },
  ]);
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [qrData, setQrData] = useState<VietQrDataDto | null>(null);

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

  const handleSelectTable = (table: DiningTableDto) => {
    setSelectedTable(table);
    setActiveTab('ORDER');
  };

  const handleAddToCart = (item: MenuItemDto, options: any[] = [], note: string = '') => {
    const extra = options.reduce((sum, opt) => sum + opt.extraPrice, 0);
    setCart((prev) => [
      ...prev,
      {
        id: 'cart-' + Date.now() + Math.random(),
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

  const handleOpenVietQr = () => {
    // Generate VietQR payload mock
    const orderId = selectedTable?.activeOrderId || 'ORD-' + Math.floor(1000 + Math.random() * 9000);
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

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Top Navbar */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 font-black text-slate-950 text-lg shadow-lg shadow-emerald-500/20">
            F
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-2">
              FABO POS CLOUD <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">v1.0</span>
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
            <span>Sơ Đồ Bàn</span>
          </button>
          <button
            onClick={() => setActiveTab('ORDER')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'ORDER' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Chọn Món & Giỏ Hàng</span>
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

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Ca: Nguyễn Văn A (Thu ngân)
          </span>
          <button className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400">
            <Bell className="w-4 h-4" />
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
              onSelectTable={handleSelectTable}
            />
          </div>
        )}

        {activeTab === 'ORDER' && (
          <div className="flex-1 flex h-full">
            <div className="flex-1">
              <OrderDrawer
                tableName={selectedTable?.tableName || ''}
                menuItems={SAMPLE_MENU}
                cart={cart}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={(id) => setCart((p) => p.filter((x) => x.id !== id))}
                onClearCart={() => setCart([])}
                orderDiscount={orderDiscount}
                onSetDiscount={setOrderDiscount}
              />
            </div>
            <TaxInvoiceSummary
              pricing={pricing}
              onOpenVietQr={handleOpenVietQr}
              onPayCash={() => alert('Thanh toán tiền mặt thành công!')}
              onSplitBill={() => alert('Mở giao diện tách bill!')}
            />
          </div>
        )}

        {activeTab === 'CHECKOUT' && (
          <div className="flex-1 flex justify-center items-center p-6 bg-slate-950">
            <TaxInvoiceSummary
              pricing={pricing}
              onOpenVietQr={handleOpenVietQr}
              onPayCash={() => alert('Thanh toán tiền mặt thành công!')}
              onSplitBill={() => alert('Mở giao diện tách bill!')}
            />
          </div>
        )}
      </main>

      {/* Dynamic VietQR Modal */}
      <VietQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        qrData={qrData}
        onPaymentSuccess={(ord) => {
          alert('Đơn hàng ' + ord + ' đã được thanh toán thành công!');
          setIsQrModalOpen(false);
          setCart([]);
        }}
      />
    </div>
  );
}

export default App;
