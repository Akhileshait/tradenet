import { useState, useCallback } from 'react';
import {
  getAccountInfo,
  getOpenOrders,
  placeOrder,
  cancelOrder,
  getTicker,
} from '@/lib/binance';
import { AccountInfo, Order, PlaceOrderParams, TickerData } from '@/types';

export function useBinanceAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = useCallback(async <T,>(
    request: () => Promise<T>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await request();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAccountInfo = useCallback(
    () => handleRequest<AccountInfo>(getAccountInfo),
    [handleRequest]
  );

  const fetchOpenOrders = useCallback(
    (symbol?: string) => handleRequest<Order[]>(() => getOpenOrders(symbol)),
    [handleRequest]
  );

  const submitOrder = useCallback(
    (params: PlaceOrderParams) => handleRequest<Order>(() => placeOrder(params)),
    [handleRequest]
  );

  const removeOrder = useCallback(
    (symbol: string, orderId: number) =>
      handleRequest<Order>(() => cancelOrder(symbol, orderId)),
    [handleRequest]
  );

  const fetchTicker = useCallback(
    (symbol: string) => handleRequest<TickerData>(() => getTicker(symbol)),
    [handleRequest]
  );

  return {
    loading,
    error,
    fetchAccountInfo,
    fetchOpenOrders,
    submitOrder,
    removeOrder,
    fetchTicker,
  };
}