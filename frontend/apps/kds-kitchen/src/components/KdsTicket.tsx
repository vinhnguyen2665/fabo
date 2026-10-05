import React, { useState, useEffect } from 'react';
import { KdsTicketDto, KitchenStatus } from '@fabo/types';
import { Clock, CheckCircle, AlertTriangle, Flame, Ban } from 'lucide-react';

export interface KdsTicketProps {
  ticket: KdsTicketDto;
  onUpdateStatus?: (orderId: string, itemId: string, status: KitchenStatus) => void;
  onReportOutOfStock?: (itemId: string, itemName: string) => void;
  onCompleteOrder?: (orderId: string) => void;
}

export const KdsTicket: React.FC<KdsTicketProps> = ({
  ticket,
  onUpdateStatus,
  onReportOutOfStock,
  onCompleteOrder,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    const start = new Date(ticket.orderTime).getTime();
    return Math.max(0, Math.floor((Date.now() - start) / 1000));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const start = new Date(ticket.orderTime).getTime();
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    }, 1000);

    return () => clearInterval(timer);
  }, [ticket.orderTime]);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const remainingSecs = elapsedSeconds % 60;
  const timeFormatted = `${String(elapsedMinutes).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;

  // Color Coding based on elapsed time:
  // Green (< 5m), Yellow (5m - 15m), Red Pulsing (> 15m)
  let statusColorClasses = 'border-emerald-500 bg-emerald-950/20 text-emerald-400';
  let badgeClasses = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  let headerClasses = 'bg-emerald-950/40 border-emerald-500/30';

  if (elapsedMinutes >= 15) {
    statusColorClasses = 'border-rose-500 bg-rose-950/40 text-rose-400 animate-pulse';
    badgeClasses = 'bg-rose-500/30 text-rose-200 border-rose-500/50';
    headerClasses = 'bg-rose-950/60 border-rose-500/40';
  } else if (elapsedMinutes >= 5) {
    statusColorClasses = 'border-amber-500 bg-amber-950/20 text-amber-400';
    badgeClasses = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    headerClasses = 'bg-amber-950/40 border-amber-500/30';
  }

  const allItemsCompleted = ticket.items.every((it) => it.status === 'COMPLETED');

  return (
    <div
      className={`flex flex-col w-80 rounded-2xl border-2 shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-300 ${statusColorClasses}`}
    >
      {/* Header */}
      <div className={`p-4 border-b flex justify-between items-center ${headerClasses}`}>
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold opacity-75">
            Bàn: {ticket.tableName}
          </span>
          <h4 className="text-xl font-black text-white tracking-tight">#{ticket.orderId}</h4>
        </div>

        {/* Timer Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-mono font-bold ${badgeClasses}`}>
          {elapsedMinutes >= 15 ? (
            <AlertTriangle className="h-4 w-4 animate-bounce text-rose-400" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
          <span>{timeFormatted}</span>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-96">
        {ticket.items.map((item) => {
          const isDone = item.status === 'COMPLETED';
          const isCooking = item.status === 'COOKING';

          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all ${
                isDone
                  ? 'bg-emerald-950/30 border-emerald-800/40 line-through opacity-60'
                  : isCooking
                  ? 'bg-amber-950/30 border-amber-600/50 shadow-inner'
                  : 'bg-slate-900/60 border-slate-700/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 font-extrabold text-white text-base">
                    {item.quantity}
                  </span>
                  <div>
                    <h5 className="font-bold text-white text-base leading-tight">
                      {item.itemName}
                    </h5>
                    {item.modifiersText && (
                      <p className="text-xs text-slate-400 mt-0.5">{item.modifiersText}</p>
                    )}
                    {item.note && (
                      <p className="text-xs text-rose-300 font-medium bg-rose-950/60 px-1.5 py-0.5 rounded mt-1 inline-block">
                        ⚠️ {item.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status action button */}
                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      onUpdateStatus &&
                      onUpdateStatus(
                        ticket.orderId,
                        item.id,
                        isCooking ? 'COMPLETED' : 'COOKING'
                      )
                    }
                    className={`p-2 rounded-lg transition active:scale-95 ${
                      isDone
                        ? 'bg-emerald-600/20 text-emerald-400'
                        : isCooking
                        ? 'bg-amber-500 text-slate-950 font-bold hover:bg-amber-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                    title={isDone ? 'Đã xong' : isCooking ? 'Bấm để Hoàn thành' : 'Bấm để Nấu'}
                  >
                    {isDone ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : isCooking ? (
                      <Flame className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="text-xs font-bold">NẤU</span>
                    )}
                  </button>

                  {/* Out of Stock quick button */}
                  {onReportOutOfStock && !isDone && (
                    <button
                      onClick={() => onReportOutOfStock(item.menuItemId, item.itemName)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                      title="Báo hết món này"
                    >
                      <Ban className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket Footer Action */}
      <div className="p-3 border-t border-white/10 bg-slate-950/60">
        <button
          onClick={() => onCompleteOrder && onCompleteOrder(ticket.orderId)}
          className={`w-full py-2.5 rounded-xl font-bold text-sm tracking-wide transition active:scale-95 flex items-center justify-center gap-2 ${
            allItemsCompleted
              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <CheckCircle className="h-4 w-4" />
          <span>{allItemsCompleted ? 'HOÀN THÀNH ĐƠN (GỌI BƯNG)' : 'XONG TOÀN BỘ MÓN'}</span>
        </button>
      </div>
    </div>
  );
};
