import crypto from 'crypto';
import { 
  AccountInfo, 
  Order, 
  PlaceOrderParams, 
  TickerData 
} from '@/types';

const BASE_URL = 'https://testnet.binance.vision';

function getApiKeys(): { apiKey: string; secretKey: string } {
  if (typeof window === 'undefined') {
    return { apiKey: '', secretKey: '' };
  }
  
  const apiKey = localStorage.getItem('binance_api_key') || '';
  const secretKey = localStorage.getItem('binance_secret_key') || '';
  
  return { apiKey, secretKey };
}

function createSignature(queryString: string, secretKey: string): string {
  return crypto
    .createHmac('sha256', secretKey)
    .update(queryString)
    .digest('hex');
}

async function makeRequest<T>(
  endpoint: string,
  method: string = 'GET',
  params: Record<string, string> = {},
  requiresAuth: boolean = false
): Promise<T> {
  const { apiKey, secretKey } = getApiKeys();
  
  if (requiresAuth && (!apiKey || !secretKey)) {
    throw new Error('API keys not configured. Please add them in Settings.');
  }

  const timestamp = Date.now().toString();
  const queryParams = requiresAuth 
    ? { ...params, timestamp }
    : params;

  const queryString = new URLSearchParams(queryParams).toString();
  const signature = requiresAuth ? createSignature(queryString, secretKey) : '';
  
  const url = requiresAuth
    ? `${BASE_URL}${endpoint}?${queryString}&signature=${signature}`
    : `${BASE_URL}${endpoint}?${queryString}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    headers['X-MBX-APIKEY'] = apiKey;
  }

  const response = await fetch(url, { method, headers });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'API request failed');
  }

  return response.json();
}

export async function getTicker(symbol: string): Promise<TickerData> {
  return makeRequest<TickerData>('/api/v3/ticker/24hr', 'GET', { symbol });
}

export async function getAccountInfo(): Promise<AccountInfo> {
  return makeRequest<AccountInfo>('/api/v3/account', 'GET', {}, true);
}

export async function getOpenOrders(symbol?: string): Promise<Order[]> {
    const params: Record<string, string> | undefined =
      symbol ? { symbol } : undefined;
  
    return makeRequest<Order[]>('/api/v3/openOrders', 'GET', params, true);
  }
  
export async function placeOrder(params: PlaceOrderParams): Promise<Order> {
  const orderParams: Record<string, string> = {
    symbol: params.symbol,
    side: params.side,
    type: params.type,
    quantity: params.quantity,
  };

  if (params.type === 'LIMIT' || params.type === 'STOP_LOSS_LIMIT') {
    if (!params.price) throw new Error('Price is required for LIMIT orders');
    orderParams.price = params.price;
    orderParams.timeInForce = params.timeInForce || 'GTC';
  }

  if (params.type === 'STOP_LOSS_LIMIT') {
    if (!params.stopPrice) throw new Error('Stop price is required for STOP_LOSS_LIMIT orders');
    orderParams.stopPrice = params.stopPrice;
  }

  return makeRequest<Order>('/api/v3/order', 'POST', orderParams, true);
}

export async function cancelOrder(symbol: string, orderId: number): Promise<Order> {
  return makeRequest<Order>(
    '/api/v3/order',
    'DELETE',
    { symbol, orderId: orderId.toString() },
    true
  );
}

export async function getKlines(
  symbol: string,
  interval: string = '1m',
  limit: number = 500
): Promise<number[][]> {
  return makeRequest<number[][]>('/api/v3/klines', 'GET', {
    symbol,
    interval,
    limit: limit.toString(),
  });
}