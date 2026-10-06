import React, { useState } from 'react';
import { MenuItemDto, OrderCartItem, ModifierOptionDto } from '@fabo/types';
import { Plus, Minus, Trash2, Tag, Utensils, MessageSquare, Sparkles, Check, Edit3 } from 'lucide-react';

export interface OrderDrawerProps {
  tableName: string;
  menuItems: MenuItemDto[];
  cart: OrderCartItem[];
  onAddToCart: (item: MenuItemDto, options?: ModifierOptionDto[], note?: string) => void;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onUpdateCartItemNote?: (cartItemId: string, note: string) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  orderDiscount: number;
  onSetDiscount: (val: number) => void;
}

const QUICK_NOTES = [
  'Không hành',
  'Ít cay',
  'Ít đá',
  'Nhiều rau',
  'Nước trong',
  'Để riêng',
  'Giao gấp',
  'Không đường',
  'Ít ngọt',
  'Trứng lòng đào',
];

const DEFAULT_GLOBAL_TOPPINGS: ModifierOptionDto[] = [
  { id: 'TOP_EGG', name: 'Trứng Chần', extraPrice: 10000 },
  { id: 'TOP_QUAY', name: 'Quẩy Giòn (3 cái)', extraPrice: 8000 },
  { id: 'TOP_BEEF', name: 'Thịt Thêm', extraPrice: 25000 },
  { id: 'TOP_RICE', name: 'Cơm Thêm', extraPrice: 10000 },
];

export const OrderDrawer: React.FC<OrderDrawerProps> = ({
  tableName,
  menuItems,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onUpdateCartItemNote,
  onRemoveItem,
  onClearCart,
  orderDiscount,
  onSetDiscount,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeItemForModal, setActiveItemForModal] = useState<MenuItemDto | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<ModifierOptionDto[]>([]);
  const [itemNote, setItemNote] = useState<string>('');
  
  // Note editing directly inside cart
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);
  const [inlineNote, setInlineNote] = useState<string>('');

  const categories = ['ALL', ...Array.from(new Set(menuItems.map((m) => m.category)))];

  const filteredItems = selectedCategory === 'ALL'
    ? menuItems
    : menuItems.filter((m) => m.category === selectedCategory);

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleOpenModifierModal = (item: MenuItemDto) => {
    setActiveItemForModal(item);
    setSelectedModifiers([]);
    setItemNote('');
  };

  const handleQuickAddDirectly = (e: React.MouseEvent, item: MenuItemDto) => {
    e.stopPropagation();
    onAddToCart(item, [], '');
  };

  const handleToggleQuickNote = (chip: string) => {
    if (itemNote.includes(chip)) {
      setItemNote((prev) =>
        prev
          .replace(new RegExp(`\\[?${chip}\\]?,?\\s*`), '')
          .trim()
      );
    } else {
      setItemNote((prev) => (prev ? `${prev}, [${chip}]` : `[${chip}]`));
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

  const handleSaveInlineNote = (cartItemId: string) => {
    if (onUpdateCartItemNote) {
      onUpdateCartItemNote(cartItemId, inlineNote);
    }
    setEditingCartItemId(null);
  };

  return (
    <div className="flex h-full border-r border-slate-800 bg-slate-900">
      {/* Left: Menu catalog */}
      <div className="flex-1 flex flex-col p-4 border-r border-slate-800">
        {/* Category horizontal scroller */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 border-b border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
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
              className="flex flex-col justify-between p-3.5 rounded-2xl border border-slate-800 hover:border-emerald-500/60 bg-slate-800/40 hover:bg-slate-800/70 hover:shadow-lg cursor-pointer transition active:scale-98 group"
            >
              <div>
                <div className="flex items-start justify-between gap-1">
                  <h4 className="font-bold text-sm text-white line-clamp-2 group-hover:text-emerald-400 transition">
                    {item.name}
                  </h4>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <span className="shrink-0 p-0.5 rounded bg-emerald-500/20 text-emerald-400" title="Có tùy chọn / Topping">
                      <Sparkles className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">{item.category}</span>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-700/50">
                <span className="font-black text-xs text-emerald-400">
                  {formatMoney(item.price)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleQuickAddDirectly(e, item)}
                    title="Thêm nhanh không ghi chú"
                    className="h-6 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center justify-center transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Cart Drawer */}
      <div className="w-80 md:w-96 flex flex-col h-full bg-slate-950 p-4 border-l border-slate-800">
        {/* Cart Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-black text-white text-base">Đơn Hàng</h3>
            <span className="text-xs text-emerald-400 font-bold">
              Bàn: {tableName || 'Chưa chọn bàn'}
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-bold"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-6">
              <Utensils className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm font-bold text-slate-400">Chưa có món nào trong đơn</p>
              <p className="text-xs text-slate-500 mt-1">Chọn món bên thực đơn để thêm vào</p>
            </div>
          ) : (
            cart.map((cartItem) => (
              <div
                key={cartItem.id}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-bold text-xs text-white">
                      {cartItem.itemName}
                    </h5>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatMoney(cartItem.unitPrice)}
                    </span>
                    {cartItem.selectedModifiers.length > 0 && (
                      <p className="text-[10px] text-emerald-400/90 mt-0.5">
                        + {cartItem.selectedModifiers.map((m) => m.name).join(', ')}
                      </p>
                    )}
                    {cartItem.note && (
                      <p className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded mt-1 inline-block">
                        {cartItem.note}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCartItemId(cartItem.id);
                        setInlineNote(cartItem.note || '');
                      }}
                      title="Sửa ghi chú"
                      className="text-slate-400 hover:text-emerald-400 p-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveItem(cartItem.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Note Editor */}
                {editingCartItemId === cartItem.id && (
                  <div className="mt-2 pt-2 border-t border-slate-800 space-y-1.5">
                    <input
                      type="text"
                      value={inlineNote}
                      onChange={(e) => setInlineNote(e.target.value)}
                      placeholder="Ghi chú món..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white outline-none"
                    />
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => setEditingCartItemId(null)}
                        className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-white"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleSaveInlineNote(cartItem.id)}
                        className="px-2.5 py-0.5 text-[10px] bg-emerald-500 text-slate-950 font-bold rounded"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                )}

                {/* Counter & Subtotal */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
                  <span className="font-mono font-black text-xs text-emerald-400">
                    {formatMoney(cartItem.unitPrice * cartItem.quantity)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateQuantity(cartItem.id, -1)}
                      className="h-6 w-6 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-xs text-white">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(cartItem.id, 1)}
                      className="h-6 w-6 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
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
        <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            Giảm giá toàn đơn:
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={orderDiscount || ''}
              placeholder="0"
              onChange={(e) => onSetDiscount(Number(e.target.value) || 0)}
              className="w-24 px-2.5 py-1 text-right text-xs rounded-xl border border-slate-700 bg-slate-900 font-bold text-amber-300 outline-none focus:border-amber-400"
            />
            <span className="text-xs text-slate-500 font-bold">₫</span>
          </div>
        </div>
      </div>

      {/* Modifier & Note selection modal */}
      {activeItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-extrabold text-base text-white">
                  Tùy biến món: {activeItemForModal.name}
                </h4>
                <p className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                  Giá gốc: {formatMoney(activeItemForModal.price)}
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
                {activeItemForModal.category}
              </span>
            </div>

            {/* Item-specific Modifiers or Fallback Toppings */}
            {activeItemForModal.modifiers && activeItemForModal.modifiers.length > 0 ? (
              activeItemForModal.modifiers.map((group) => (
                <div key={group.id} className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">
                    {group.name}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {group.options.map((opt) => {
                      const isSelected = selectedModifiers.some((m) => m.id === opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedModifiers((prev) => prev.filter((m) => m.id !== opt.id));
                            } else {
                              setSelectedModifiers((prev) => [...prev, opt]);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-medium text-left flex justify-between items-center transition ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-sm'
                              : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span>{opt.name}</span>
                          {opt.extraPrice > 0 && (
                            <span className="text-[10px] text-emerald-400 font-mono font-bold">
                              +{formatMoney(opt.extraPrice)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              /* Global Common Toppings for items without defined groups */
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Topping / Món ăn kèm phổ biến:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {DEFAULT_GLOBAL_TOPPINGS.map((opt) => {
                    const isSelected = selectedModifiers.some((m) => m.id === opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedModifiers((prev) => prev.filter((m) => m.id !== opt.id));
                          } else {
                            setSelectedModifiers((prev) => [...prev, opt]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left flex justify-between items-center transition ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-sm'
                            : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{opt.name}</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          +{formatMoney(opt.extraPrice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick 1-touch note chips */}
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                Ghi chú nhanh 1 chạm cho bếp:
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {QUICK_NOTES.map((chip) => {
                  const isActive = itemNote.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleToggleQuickNote(chip)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3" />}
                      <span>{chip}</span>
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                placeholder="Ghi chú khác (VD: mang trước, không cho tỏi...)"
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveItemForModal(null)}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmModifiers}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20"
              >
                Xác Nhận Thêm Vào Đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
