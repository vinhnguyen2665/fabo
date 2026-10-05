import React from 'react';
import { KdsTicketDto } from '@fabo/types';
import { Layers, Flame, Check } from 'lucide-react';

export interface ItemAggregationViewProps {
  tickets: KdsTicketDto[];
  onBatchCompleteItem?: (menuItemId: string) => void;
}

export const ItemAggregationView: React.FC<ItemAggregationViewProps> = ({
  tickets,
  onBatchCompleteItem,
}) => {
  // Aggregate items across all pending/cooking tickets
  const aggregatedMap = new Map<string, { menuItemId: string; itemName: string; totalQty: number; tables: string[] }>();

  tickets.forEach((ticket) => {
    ticket.items.forEach((item) => {
      if (item.status !== 'COMPLETED') {
        const existing = aggregatedMap.get(item.menuItemId) || {
          menuItemId: item.menuItemId,
          itemName: item.itemName,
          totalQty: 0,
          tables: [],
        };
        existing.totalQty += item.quantity;
        if (!existing.tables.includes(ticket.tableName)) {
          existing.tables.push(ticket.tableName);
        }
        aggregatedMap.set(item.menuItemId, existing);
      }
    });
  });

  const aggregatedList = Array.from(aggregatedMap.values()).sort((a, b) => b.totalQty - a.totalQty);

  return (
    <div className="p-6 bg-slate-950 text-white h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <Layers className="w-6 h-6 text-amber-400" />
        <h2 className="text-xl font-black tracking-tight">
          Chế Độ Gom Đơn Chế Biến (Bếp Trưởng)
        </h2>
      </div>

      {aggregatedList.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-500">
          <p>Hiện không có món nào đang chờ chế biến</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {aggregatedList.map((agg) => (
            <div
              key={agg.menuItemId}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-extrabold text-lg text-white leading-snug">
                    {agg.itemName}
                  </h3>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 font-mono font-black text-xl border border-amber-500/40">
                    {agg.totalQty}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Gồm các bàn: <span className="text-slate-200 font-medium">{agg.tables.join(', ')}</span>
                </p>
              </div>

              <button
                onClick={() => onBatchCompleteItem && onBatchCompleteItem(agg.menuItemId)}
                className="mt-4 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Hoàn tất {agg.totalQty} phần</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
