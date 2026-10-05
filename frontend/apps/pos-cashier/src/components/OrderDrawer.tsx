import React, { useState } from 'react';
import { MenuItemDto, OrderCartItem, ModifierOptionDto } from '@fabo/types';
import { Plus, Minus, Trash2, Tag, Utensils, MessageSquare } from 'lucide-react';

export interface OrderDrawerProps {
  tableName: string;
  menuItems: MenuItemDto[];
  cart: OrderCartItem[];
  onAddToCart: (item: MenuItemDto, options?: ModifierOptionDto[], note?: string) => void;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  orderDiscount: number;
  onSetDiscount: (val: number) => void;
}

export const OrderDrawer: React.FC<OrderDrawerProps> = ({
  tableName,
  menuItems,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  orderDiscount,
  onSetDiscount,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeItemForModal, setActiveItemForModal] = useState<MenuItemDto | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<ModifierOptionDto[]>([]);
  const [itemNote, setItemNote] = useState<string>('');

  const categories = ['ALL', ...Array.from(new Set(menuItems.map((m) => m.category)))];

  const filteredItems = selectedCategory === 'ALL'
    ? menuItems
    : menuItems.filter((m) => m.category === selectedCategory);

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleOpenModifierModal = (item: MenuItemDto) => {
    if (item.modifiers && item.modifiers.length > 0) {
      setActiveItemForModal(item);
      setSelectedModifiers([]);
      setItemNote('');
    } else {
      onAddToCart(item, [], '');
    }
  };

  const handleConfirmModifiers = () => {
    if (activeItemForModal) {
      onAddToCart(activeItemForModal, selectedModifiers, itemNote);
      setActiveItemForModal(null);
      setSelectedModifiers([]);
      setItemNote('');
    }
  };

  return (
    <div className="flex h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      {/* Left: Menu catalog */}
      <div className="flex-1 flex flex-col p-4 border-r border-slate-100 dark:border-slate-800/80">
        {/* Category horizontal scroller */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {cat === 'ALL' ? 'Tất cả thực đơn' : cat}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto pr-1">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenModifierModal(item)}
              className="flex flex-col justify-between p-3 rounded-2xl border border-slate-200 hover:border-slate-900 bg-white hover:shadow-md cursor-pointer transition active:scale-98 dark:bg-slate-800/40 dark:border-slate-700/60 dark:hover:border-slate-500"
            >
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-2">
                  {item.name}
                </h4>
                <span className="text-[11px] text-slate-400 block mt-0.5">{item.category}</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/40">
                <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                  {formatMoney(item.price)}
                </span>
                <span className="h-6 w-6 rounded-lg bg-slate-900 text-white flex items-center justify-center dark:bg-slate-100 dark:text-slate-900">
                  <Plus className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Cart Drawer */}
      <div className="w-80 md:w-96 flex flex-col h-full bg-slate-50 dark:bg-slate-950 p-4">
        {/* Cart Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">Đơn Hàng</h3>
            <span className="text-xs text-slate-500">Bàn: {tableName || 'Chưa chọn bàn'}</span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-xs text-rose-500 hover:underline font-medium"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
              <Utensils className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm font-medium">Chưa có món nào trong đơn</p>
              <p className="text-xs text-slate-500 mt-1">Chọn món bên thực đơn để thêm vào</p>
            </div>
          ) : (
            cart.map((cartItem) => (
              <div
                key={cartItem.id}
                className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {cartItem.itemName}
                    </h5>
                    <span className="text-[11px] text-slate-500">
                      {formatMoney(cartItem.unitPrice)}
                    </span>
                    {cartItem.selectedModifiers.length > 0 && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        + {cartItem.selectedModifiers.map((m) => m.name).join(', ')}
                      </p>
                    )}
                    {cartItem.note && (
                      <p className="text-[10px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded mt-1 inline-block dark:bg-amber-950/40">
                        {cartItem.note}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveItem(cartItem.id)}
                    className="text-slate-300 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Counter */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-black text-xs text-slate-800 dark:text-slate-200">
                    {formatMoney(cartItem.unitPrice * cartItem.quantity)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateQuantity(cartItem.id, -1)}
                      className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center hover:bg-slate-200 dark:bg-slate-800"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-xs">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(cartItem.id, 1)}
                      className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center hover:bg-slate-200 dark:bg-slate-800"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Global Discount input */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Tag className="w-3.5 h-3.5 text-amber-500" />
            Giảm giá toàn đơn:
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={orderDiscount || ''}
              placeholder="0"
              onChange={(e) => onSetDiscount(Number(e.target.value) || 0)}
              className="w-24 px-2 py-1 text-right text-xs rounded-lg border border-slate-200 bg-white font-bold dark:bg-slate-900 dark:border-slate-700"
            />
            <span className="text-xs text-slate-400">₫</span>
          </div>
        </div>
      </div>

      {/* Modifier selection modal */}
      {activeItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl dark:bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-lg text-slate-900 dark:text-white">
              Tùy biến: {activeItemForModal.name}
            </h4>
            <p className="text-xs text-slate-500 mb-4">{formatMoney(activeItemForModal.price)}</p>

            {activeItemForModal.modifiers?.map((group) => (
              <div key={group.id} className="mb-4">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  {group.name}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {group.options.map((opt) => {
                    const isSelected = selectedModifiers.some((m) => m.id === opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedModifiers((prev) => prev.filter((m) => m.id !== opt.id));
                          } else {
                            setSelectedModifiers((prev) => [...prev, opt]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left flex justify-between items-center transition ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                            : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700'
                        }`}
                      >
                        <span>{opt.name}</span>
                        {opt.extraPrice > 0 && (
                          <span className="text-[10px] opacity-80">+{formatMoney(opt.extraPrice)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Note input */}
            <div className="mb-4">
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> Ghi chú đặc biệt cho bếp:
              </label>
              <input
                type="text"
                placeholder="VD: Không cay, ít đá, không hành..."
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveItemForModal(null)}
                className="flex-1 py-2.5 rounded-xl border text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmModifiers}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                Xác nhận thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
