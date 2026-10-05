import React, { useState } from 'react';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { RecipeBomEditor } from './components/RecipeBomEditor';
import { BarChart3, Package, Users, DollarSign, Settings, Utensils } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'INVENTORY' | 'SHIFTS'>('ANALYTICS');

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4">
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-800">
          <div className="h-9 w-9 rounded-xl bg-purple-600 flex items-center justify-center font-black text-white text-lg">
            F
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight">FABO ADMIN PORTAL</h1>
            <span className="text-[11px] text-slate-400">Quản Trị Hệ Thống Chuỗi</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
              activeTab === 'ANALYTICS' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Báo Cáo & Menu Matrix
          </button>
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
              activeTab === 'INVENTORY' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" /> Kho & Định Lượng (BOM)
          </button>
          <button
            onClick={() => setActiveTab('SHIFTS')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
              activeTab === 'SHIFTS' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" /> Quỹ Két & Kết Ca
          </button>
        </nav>

        <div className="pt-4 border-t border-slate-800 text-xs text-slate-500">
          Đăng nhập: Giám đốc chuỗi
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'ANALYTICS' && <AnalyticsDashboard />}
        {activeTab === 'INVENTORY' && <RecipeBomEditor />}
        {activeTab === 'SHIFTS' && (
          <div className="p-8 text-center text-slate-400">
            <h2 className="text-xl font-bold text-white mb-2">Báo Cáo Kết Két Ca Thu Ngân</h2>
            <p className="text-xs">Đối soát tiền mặt thực tế vs doanh thu thẻ/VietQR</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
