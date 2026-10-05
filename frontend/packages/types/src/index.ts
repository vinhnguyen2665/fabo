// ==========================================
// FABO POS CLOUD - SHARED TYPESCRIPT TYPES
// ==========================================

export type TableStatus = 'EMPTY' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

export interface DiningTableDto {
  id: string;
  tableName: string;
  areaId: string;
  areaName: string;
  branchId: string;
  status: TableStatus;
  capacity: number;
  activeOrderId?: string;
  occupiedSince?: string;
}

export interface MenuItemDto {
  id: string;
  name: string;
  price: number;
  taxRate: number; // 0.0, 0.05, 0.08, 0.10
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  modifiers?: ModifierGroupDto[];
}

export interface ModifierOptionDto {
  id: string;
  name: string;
  extraPrice: number;
}

export interface ModifierGroupDto {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  options: ModifierOptionDto[];
}

export interface OrderCartItem {
  id: string; // unique cart entry id
  menuItemId: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  taxRate: number;
  selectedModifiers: { groupId: string; optionId: string; name: string; price: number }[];
  note?: string;
}

export interface TaxCalculationResultDto {
  taxMode: 'TAX_INCLUSIVE' | 'TAX_EXCLUSIVE';
  rawSubtotal: number;
  totalDiscount: number;
  netSubtotal: number;
  serviceChargeAmount: number;
  totalTax: number;
  taxBreakdownByRate: Record<string, number>;
  finalAmount: number;
}

export interface VietQrDataDto {
  qrRawPayload: string;
  qrBase64Image: string;
  crc: string;
  amount: number;
  bnbBin: string;
  consumerId: string;
  bankName?: string;
  accountHolder?: string;
  purpose: string;
  billNumber: string;
}

export type KitchenStatus = 'PENDING' | 'COOKING' | 'COMPLETED' | 'CANCELLED';

export interface KdsTicketItemDto {
  id: string;
  menuItemId: string;
  itemName: string;
  quantity: number;
  modifiersText?: string;
  note?: string;
  status: KitchenStatus;
}

export interface KdsTicketDto {
  orderId: string;
  branchId: string;
  tableId: string;
  tableName: string;
  items: KdsTicketItemDto[];
  orderTime: string; // ISO date string
  elapsedMinutes?: number;
}

export interface PaymentCompletedEventDto {
  eventId: string;
  orderId: string;
  invoiceId: string;
  amount: number;
  paymentMethod: 'VIETQR' | 'CASH' | 'CARD';
  transactionRef: string;
  completedAt: string;
}
