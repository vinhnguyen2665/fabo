import React from 'react';
import { KdsTicketDto, KitchenStatus } from '@fabo/types';
import { KdsTicket } from './KdsTicket';
import { Inbox, CheckCheck, Clock } from 'lucide-react';

export interface KdsKanbanBoardProps {
  tickets: KdsTicketDto[];
  onUpdateStatus: (orderId: string, itemId: string, status: KitchenStatus) => void;
  onReportOutOfStock: (itemId: string, itemName: string) => void;
  onCompleteOrder: (orderId: string) => void;
}

export const KdsKanbanBoard: React.FC<KdsKanbanBoardProps> = ({
  tickets,
  onUpdateStatus,
  onReportOutOfStock,
  onCompleteOrder,
}) => {
  return (
    <div className="flex-1 flex gap-4 p-4 overflow-x-auto bg-slate-950">
      {tickets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
          <Inbox className="w-12 h-12 mb-3 opacity-30" />
          <h3 className="text-lg font-bold">Không Có Đơn Hàng Mới</h3>
          <p className="text-xs text-slate-500 mt-1">Đơn từ quầy thu ngân và khách QR sẽ tự động hiển thị tại đây</p>
        </div>
      ) : (
        tickets.map((ticket) => (
          <div key={ticket.orderId} className="flex-shrink-0">
            <KdsTicket
              ticket={ticket}
              onUpdateStatus={onUpdateStatus}
              onReportOutOfStock={onReportOutOfStock}
              onCompleteOrder={onCompleteOrder}
            />
          </div>
        ))
      )}
    </div>
  );
};
