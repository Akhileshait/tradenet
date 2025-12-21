// packages/shared/index.ts
export * from '@prisma/client';

export interface OrderPayload {
  orderId: string;
  userId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  quantity: number;
}

export interface OrderUpdate {
  type: 'ORDER_UPDATE';
  data: {
    orderId: string;
    status: string;
    symbol: string;
    price?: number;
  };
}