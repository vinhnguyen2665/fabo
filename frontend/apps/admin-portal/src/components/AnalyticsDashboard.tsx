import React from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Award, BarChart3, Star, Zap, HelpCircle, AlertOctagon } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const formatMoney = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="p-6 bg-slate-950 text-white min-h-full overflow-y-auto space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Doanh Thu Hôm Nay</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-black mt-2 text-white">42,850,000 ₫</h3>
          <span className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> +14.2% so với hôm qua
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Tổng Số Đơn Hàng</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-2xl font-black mt-2 text-white">186 đơn</h3>
          <span className="text-xs text-slate-400 mt-1 block">AOV: 230,000 ₫/đơn</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Tỷ Lệ Lợi Nhuận Gộp</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-2xl font-black mt-2 text-white">68.4%</h3>
          <span className="text-xs text-emerald-400 mt-1 block">Chi phí nguyên liệu COGS: 31.6%</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Tỷ Lệ Thanh Toán VietQR</span>
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-2xl font-black mt-2 text-white">74.5%</h3>
          <span className="text-xs text-slate-400 mt-1 block">Tiền mặt: 18.2% | Thẻ: 7.3%</span>
        </div>
      </div>

      {/* Menu Engineering 4-Quadrant BCG Matrix */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" /> Ma Trận Menu Engineering (BCG Matrix)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Phân tích biên độ lợi nhuận và sức bán để tối ưu thực đơn F&B
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stars */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm mb-2">
              <Star className="w-4 h-4 fill-emerald-400" />
              <span>STARS (Ngôi Sao - Lợi nhuận cao + Bán chạy)</span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Chiến lược: Giữ nguyên chất lượng, đặt ở vị trí trung tâm menu.
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between bg-slate-900/60 p-2 rounded-xl">
                <span>Phở Bò Tái Nạm Đặc Biệt</span>
                <span className="font-mono text-emerald-400 font-bold">142 phần (LN: 62%)</span>
              </div>
              <div className="flex justify-between bg-slate-900/60 p-2 rounded-xl">
                <span>Cà Phê Muối Xứ Huế</span>
                <span className="font-mono text-emerald-400 font-bold">198 ly (LN: 78%)</span>
              </div>
            </div>
          </div>

          {/* Plowhorses */}
          <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/40">
            <div className="flex items-center gap-2 text-blue-400 font-extrabold text-sm mb-2">
              <Zap className="w-4 h-4 fill-blue-400" />
              <span>PLOWHORSES (Ngựa Cày - Bán chạy nhưng Lợi nhuận thấp)</span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Chiến lược: Tăng giá nhẹ hoặc giảm khẩu phần định lượng để tăng biên độ lãi.
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between bg-slate-900/60 p-2 rounded-xl">
                <span>Cơm Rang Dưa Bò</span>
                <span className="font-mono text-blue-400 font-bold">115 phần (LN: 38%)</span>
              </div>
            </div>
          </div>

          {/* Puzzles */}
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm mb-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>PUZZLES (Câu Đố - Lợi nhuận cao nhưng Kén người gọi)</span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Chiến lược: Đẩy mạnh combo marketing, nhân viên thu ngân chủ động upsell.
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between bg-slate-900/60 p-2 rounded-xl">
                <span>Bia Craft IPA Thủ Công</span>
                <span className="font-mono text-amber-400 font-bold">18 chai (LN: 72%)</span>
              </div>
            </div>
          </div>

          {/* Dogs */}
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40">
            <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm mb-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>DOGS (Chó Mực - Lợi nhuận thấp & Bán chậm)</span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Chiến lược: Cân nhắc loại bỏ khỏi thực đơn để giảm tồn kho nguyên liệu hao hụt.
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between bg-slate-900/60 p-2 rounded-xl">
                <span>Súp Hải Sản Rong Biển</span>
                <span className="font-mono text-rose-400 font-bold">4 phần (LN: 32%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
