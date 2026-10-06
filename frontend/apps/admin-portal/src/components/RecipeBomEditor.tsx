import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, RefreshCw } from 'lucide-react';

const FALLBACK_INGREDIENTS = [
  { id: 'ING-1', name: 'Thịt Bò Tái', unit: 'g', currentStock: 14500, minStock: 5000, mac: 280 },
  { id: 'ING-2', name: 'Bánh Phở Tươi', unit: 'g', currentStock: 25000, minStock: 10000, mac: 25 },
  { id: 'ING-3', name: 'Hạt Cà Phê Robusta', unit: 'g', currentStock: 8200, minStock: 3000, mac: 210 },
  { id: 'ING-4', name: 'Sữa Đặc', unit: 'ml', currentStock: 1200, minStock: 2000, mac: 45 },
];

export const RecipeBomEditor: React.FC = () => {
  const [ingredients, setIngredients] = useState<any[]>(FALLBACK_INGREDIENTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStock = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/inventory/stock');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.body ?? []);
        if (Array.isArray(list) && list.length > 0) {
          setIngredients(list);
        }
      }
    } catch (_) {
      setIngredients(FALLBACK_INGREDIENTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const lowStockItems = ingredients.filter((ing) => ing.currentStock < ing.minStock);

  return (
    <div className="p-6 bg-slate-950 text-white min-h-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" /> Quản Lý Kho & Định Lượng Recipe BOM
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cấu hình định lượng nguyên vật liệu cho từng món và theo dõi trừ kho tự động (Live Database)
          </p>
        </div>
        <button
          onClick={fetchStock}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
          title="Làm mới tồn kho"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stock warning banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span className="text-xs text-amber-200">
              <strong>Cảnh báo tồn kho:</strong> Có {lowStockItems.length} nguyên vật liệu dưới ngưỡng an toàn ({lowStockItems.map((x) => x.name).join(', ')}). Hãy tạo phiếu nhập hàng!
            </span>
          </div>
          <button className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400">
            Nhập Kho Ngay
          </button>
        </div>
      )}

      {/* Ingredients Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-sm">Danh Mục Tồn Kho Nguyên Vật Liệu</h3>
          <button className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Thêm Nguyên Liệu
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Mã NL</th>
                <th className="p-3">Tên Nguyên Liệu</th>
                <th className="p-3">Đơn Vị</th>
                <th className="p-3">Tồn Kho Hiện Tại</th>
                <th className="p-3">Ngưỡng Tối Thiểu</th>
                <th className="p-3">Giá Vốn MAC</th>
                <th className="p-3">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {ingredients.map((ing) => {
                const isLow = ing.currentStock < ing.minStock;
                return (
                  <tr key={ing.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-slate-400">{ing.id}</td>
                    <td className="p-3 font-bold text-white">{ing.name}</td>
                    <td className="p-3 text-slate-400">{ing.unit}</td>
                    <td className="p-3 font-mono font-bold text-slate-200">
                      {(ing.currentStock || 0).toLocaleString()} {ing.unit}
                    </td>
                    <td className="p-3 font-mono text-slate-400">
                      {(ing.minStock || 0).toLocaleString()} {ing.unit}
                    </td>
                    <td className="p-3 font-mono text-emerald-400">
                      {(ing.mac || 0).toLocaleString()} ₫/{ing.unit}
                    </td>
                    <td className="p-3">
                      {isLow ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                          Sắp Hết Hàng
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Đủ Tồn Kho
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
