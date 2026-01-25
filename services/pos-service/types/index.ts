export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  CLEANING = 'CLEANING',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  DIGITAL = 'DIGITAL',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum KotStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED',
}

export interface CreateTableDto {
  branchId: string;
  tableNumber: string;
  capacity: number;
  status?: TableStatus;
}

export interface UpdateTableDto {
  tableNumber?: string;
  capacity?: number;
  status?: TableStatus;
}

export interface CreateOrderDto {
  branchId: string;
  tableId?: string;
  orderType: OrderType;
  customerId?: string;
  items: OrderItemDto[];
  notes?: string;
}

export interface OrderItemDto {
  productId: string;
  quantity: number;
  price: number;
  modifiers?: string[];
  notes?: string;
}

export interface SplitBillDto {
  orderId: string;
  items: string[]; // OrderItem IDs to split
}

export interface MergeBillDto {
  orderIds: string[];
}

export interface ApplyDiscountDto {
  orderId: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  description?: string;
}

export interface CreatePaymentDto {
  orderId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  reference?: string;
  notes?: string;
}

export interface CreateKotDto {
  orderId: string;
  kitchenId?: string;
}

export interface UpdateKotStatusDto {
  status: KotStatus;
}

export interface OrderResponse {
  id: string;
  branchId: string;
  tableId: string | null;
  orderType: OrderType;
  status: OrderStatus;
  customerId: string | null;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  total: number;
  items: OrderItemResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemResponse {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  modifiers: string[];
  notes: string | null;
}

export interface TableResponse {
  id: string;
  branchId: string;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  currentOrderId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  reference: string | null;
  notes: string | null;
  createdAt: Date;
}

export interface KotResponse {
  id: string;
  orderId: string;
  kitchenId: string | null;
  status: KotStatus;
  items: KotItemResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KotItemResponse {
  id: string;
  kotId: string;
  orderItemId: string;
  productName: string;
  quantity: number;
  status: KotStatus;
}

