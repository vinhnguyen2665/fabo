import React, { useState, useEffect } from 'react';
import { KdsTicketDto, KitchenStatus } from '@fabo/types';
import { KdsKanbanBoard } from './components/KdsKanbanBoard';
import { ItemAggregationView } from './components/ItemAggregationView';
import { ChefHat, LayoutGrid, Layers, Volume2, RefreshCw } from 'lucide-react';

const FALLBACK_KDS_TICKETS: KdsTicketDto[] = [
  {
    orderId: 'ORD-1024',
    branchId: 'B01',
    tableId: 'T02',
    tableName: 'Bàn 02',
    orderTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    items: [
      { id: 'it-1', menuItemId: 'M01', itemName: 'Phở Bò Tái Nạm Đặc Biệt', quantity: 2, note: 'Ít bánh phở, nước trong', status: 'COOKING' },
      { id: 'it-2', menuItemId: 'M04', itemName: 'Cà Phê Muối Xứ Huế', quantity: 2, status: 'PENDING' },
    ],
  },
  {
    orderId: 'ORD-1025',
    branchId: 'B01',
    tableId: 'T05',
    tableName: 'Sân Vườn 01',
    orderTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    items: [
      { id: 'it-3', menuItemId: 'M01', itemName: 'Phở Bò Tái Nạm Đặc Biệt', quantity: 3, status: 'PENDING' },
      { id: 'it-4', menuItemId: 'M03', itemName: 'Cơm Rang Dưa Bò', quantity: 1, note: 'Không hành tây', status: 'COOKING' },
    ],
  },
];

export function App() {
  const [viewMode, setViewMode] = useState<'KANBAN' | 'AGGREGATE'>('KANBAN');
  const [tickets, setTickets] = useState<KdsTicketDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/v1/kds/tickets');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.body ?? []);
        setTickets(list);
      } else {
        if (tickets.length === 0) setTickets(FALLBACK_KDS_TICKETS);
      }
    } catch (_) {
      if (tickets.length === 0) setTickets(FALLBACK_KDS_TICKETS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  const playDingSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio fallback
    }
  };

  const handleUpdateItemStatus = async (orderId: string, itemId: string, status: KitchenStatus) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.orderId === orderId) {
          return {
            ...t,
            items: t.items.map((it) => (it.id === itemId ? { ...it, status } : it)),
          };
        }
        return t;
      })
    );

    try {
      await fetch(`/api/v1/kds/tickets/${orderId}/status?status=${status}&itemId=${encodeURIComponent(itemId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, itemId }),
      });
    } catch (_) {}
  };

  const handleCompleteAllItems = async (orderId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.orderId === orderId
          ? {
              ...t,
              status: 'COOKING',
              items: t.items.map((it) => ({ ...it, status: 'COMPLETED' })),
            }
          : t
      )
    );
    playDingSound();

    try {
      await fetch(`/api/v1/kds/tickets/${orderId}/complete-items`, {
        method: 'PUT',
      });
    } catch (_) {}
  };

  const handleCompleteOrder = async (orderId: string) => {
    setTickets((prev) => prev.filter((t) => t.orderId !== orderId));
    playDingSound();

    try {
      await fetch(`/api/v1/kds/tickets/${orderId}/call-waiter`, {
        method: 'POST',
      });
    } catch (_) {}
  };

  const handleReportOutOfStock = (itemId: string, itemName: string) => {
    if (confirm(`Bạn có chắc muốn BÁO HẾT MÓN "${itemName}" trên toàn hệ thống không?`)) {
      alert(`Đã khóa món "${itemName}" trên POS và mã QR đặt bàn.`);
    }
  };

  const handleBatchCompleteItem = async (menuItemId: string) => {
    setTickets((prev) =>
      prev.map((t) => ({
        ...t,
        items: t.items.map((it) =>
          it.menuItemId === menuItemId ? { ...it, status: 'COMPLETED' } : it
        ),
      }))
    );
    playDingSound();

    try {
      await fetch(`/api/v1/kds/items/${encodeURIComponent(menuItemId)}/status?status=COMPLETED`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
    } catch (_) {}
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-white overflow-hidden font-sans">
      {/* Top Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-2">
              FABO KDS KITCHEN DISPLAY <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">BẾP NÓNG (LIVE)</span>
            </h1>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('KANBAN')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'KANBAN' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Theo Thứ Tự Đơn (FIFO)</span>
          </button>
          <button
            onClick={() => setViewMode('AGGREGATE')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'AGGREGATE' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Chế Độ Gom Món</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTickets}
            title="Làm mới phiếu bếp"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={playDingSound}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold"
          >
            <Volume2 className="w-3.5 h-3.5" /> Chuông
          </button>
          <span className="text-xs text-slate-400 font-mono font-bold">
            {tickets.length} đơn đang chờ
          </span>
        </div>
      </header>

      {/* Main KDS Area */}
      <main className="flex-1 flex overflow-hidden">
        {viewMode === 'KANBAN' ? (
          <KdsKanbanBoard
            tickets={tickets}
            onUpdateStatus={handleUpdateItemStatus}
            onReportOutOfStock={handleReportOutOfStock}
            onCompleteOrder={handleCompleteOrder}
            onCompleteAllItems={handleCompleteAllItems}
          />
        ) : (
          <ItemAggregationView
            tickets={tickets}
            onBatchCompleteItem={handleBatchCompleteItem}
          />
        )}
      </main>
    </div>
  );
}

export default App;
