import { useEffect, useRef, useState, useCallback } from 'react';
import { KlineData, Trade, OrderBookEntry } from '@/types';

const WS_BASE_URL = 'wss://testnet.binance.vision/ws';

export function useTradeWebSocket(symbol: string) {
  const [klineData, setKlineData] = useState<KlineData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<string>('0');
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookEntry[]; asks: OrderBookEntry[] }>({
    bids: [],
    asks: [],
  });
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const connectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    const streams = [
      `${symbol.toLowerCase()}@kline_1m`,
      `${symbol.toLowerCase()}@trade`,
      `${symbol.toLowerCase()}@depth20@100ms`,
    ];

    const ws = new WebSocket(`${WS_BASE_URL}/${streams.join('/')}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected for', symbol);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.e === 'kline') {
          const kline = data.k;
          const newCandle: KlineData = {
            time: kline.t / 1000,
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c),
            volume: parseFloat(kline.v),
          };

          setKlineData((prev) => {
            const existing = prev.findIndex((k) => k.time === newCandle.time);
            if (existing !== -1) {
              const updated = [...prev];
              updated[existing] = newCandle;
              return updated;
            }
            return [...prev.slice(-499), newCandle];
          });

          setCurrentPrice(kline.c);
        }

        if (data.e === 'trade') {
          const trade: Trade = {
            id: data.t,
            price: data.p,
            qty: data.q,
            time: data.T,
            isBuyerMaker: data.m,
          };

          setRecentTrades((prev) => [trade, ...prev.slice(0, 49)]);
        }

        if (data.e === 'depthUpdate') {
          const bids: OrderBookEntry[] = data.b.slice(0, 20).map((b: string[]) => ({
            price: b[0],
            quantity: b[1],
          }));

          const asks: OrderBookEntry[] = data.a.slice(0, 20).map((a: string[]) => ({
            price: a[0],
            quantity: a[1],
          }));

          setOrderBook({ bids, asks });
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket closed, attempting reconnect...');
      setIsConnected(false);
      reconnectTimeoutRef.current = setTimeout(() => {
        connectRef.current?.();
      }, 3000);
    };
  }, [symbol]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    klineData,
    currentPrice,
    recentTrades,
    orderBook,
    isConnected,
  };
}