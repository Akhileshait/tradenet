export interface KlineData {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }
  
  export interface TickerData {
    symbol: string;
    price: string;
    priceChange: string;
    priceChangePercent: string;
    high: string;
    low: string;
    volume: string;
  }
  
  export interface OrderBookEntry {
    price: string;
    quantity: string;
    total?: number;
  }
  
  export interface Trade {
    id: number;
    price: string;
    qty: string;
    time: number;
    isBuyerMaker: boolean;
  }
  
  export interface Order {
    symbol: string;
    orderId: number;
    clientOrderId: string;
    price: string;
    origQty: string;
    executedQty: string;
    status: string;
    type: string;
    side: 'BUY' | 'SELL';
    time: number;
  }
  
  export interface Balance {
    asset: string;
    free: string;
    locked: string;
  }
  
  export interface AccountInfo {
    balances: Balance[];
    canTrade: boolean;
  }
  
  export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_LOSS_LIMIT';
  export type OrderSide = 'BUY' | 'SELL';
  export type TimeInForce = 'GTC' | 'IOC' | 'FOK';
  
  export interface PlaceOrderParams {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    quantity: string;
    price?: string;
    stopPrice?: string;
    timeInForce?: TimeInForce;
  }