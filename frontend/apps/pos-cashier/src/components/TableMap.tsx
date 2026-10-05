import React, { useState } from 'react';
import { DiningTableDto, TableStatus } from '@fabo/types';
import { Users, Clock, ArrowRightLeft, Merge, Coffee } from 'lucide-react';

export interface TableMapProps {
  tables: DiningTableDto[];
  selectedTable: DiningTableDto | null;
  onSelectTable: (table: DiningTableDto) => void;
  onMergeTable?: (sourceTableId: string, targetTableId: string) => void;
  onTransferTable?: (sourceTableId: string, targetTableId: string) => void;
}

export const TableMap: React.FC<TableMapProps> = ({
  tables,
  selectedTable,
  onSelectTable,
  onMergeTable,
  onTransferTable,
}) => {
  const [activeArea, setActiveArea] = useState<string>('ALL');

  // Extract unique areas
  const areas = ['ALL', ...Array.from(new Set(tables.map((t) => t.areaName)))];

  const filteredTables = activeArea === 'ALL'
    ? tables
    : tables.filter((t) => t.areaName === activeArea);

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'EMPTY':
        return 'border-emerald-500/40 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800';
      case 'OCCUPIED':
        return 'border-blue-500/50 bg-blue-50/50 hover:bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-700';
      case 'RESERVED':
        return 'border-purple-500/40 bg-purple-50/50 hover:bg-purple-50 text-purple-900 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800';
      case 'CLEANING':
        return 'border-amber-500/40 bg-amber-50/50 hover:bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800';
    }
  };

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'EMPTY':
        return <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">Trống</span>;
      case 'OCCUPIED':
        return <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">Có Khách</span>;
      case 'RESERVED':
        return <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">Đặt Trước</span>;
      case 'CLEANING':
        return <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">Chờ Dọn</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 p-4">
      {/* Area Selector Tabs */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => setActiveArea(area)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                activeArea === area
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow'
                  : 'bg-white text-slate-600 hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {area === 'ALL' ? 'Tất cả khu vực' : area}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Trống</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Có khách</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Đặt trước</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Chờ dọn</span>
        </div>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 overflow-y-auto pr-1">
        {filteredTables.map((table) => {
          const isSelected = selectedTable?.id === table.id;

          return (
            <div
              key={table.id}
              onClick={() => onSelectTable(table)}
              className={`relative cursor-pointer rounded-2xl border-2 p-3.5 transition-all duration-200 shadow-sm flex flex-col justify-between h-36 ${getStatusColor(
                table.status
              )} ${
                isSelected
                  ? 'ring-4 ring-slate-900/30 dark:ring-white/30 scale-102 shadow-md'
                  : 'hover:scale-101 hover:shadow'
              }`}
            >
              {/* Table Header */}
              <div className="flex justify-between items-start">
                <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                  {table.tableName}
                </span>
                {getStatusBadge(table.status)}
              </div>

              {/* Middle Info */}
              <div className="my-auto space-y-1">
                <div className="flex items-center gap-1 text-xs opacity-75">
                  <Coffee className="w-3.5 h-3.5" />
                  <span>{table.areaName}</span>
                </div>
                <div className="flex items-center gap-1 text-xs opacity-75">
                  <Users className="w-3.5 h-3.5" />
                  <span>Sức chứa: {table.capacity} khách</span>
                </div>
              </div>

              {/* Table Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5 text-[11px] opacity-80">
                {table.status === 'OCCUPIED' ? (
                  <span className="font-mono font-bold">#{table.activeOrderId}</span>
                ) : (
                  <span>Sẵn sàng đón khách</span>
                )}
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onTransferTable) onTransferTable(table.id, '');
                    }}
                    title="Chuyển bàn"
                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onMergeTable) onMergeTable(table.id, '');
                    }}
                    title="Gộp bàn"
                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                  >
                    <Merge className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
