import { useEffect, useRef, useState } from 'react';
import { KlineData, Trade, OrderBookEntry } from '@/types';

// 1. Use Port 443 (Standard) instead of 9443 to avoid firewall blocking
const WS_BASE_URL = 'wss://stream.binance.com:443';

export function useTradeWebSocket(symbol: string) {
  const [klineData, setKlineData] = useState<KlineData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<string>('0');
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookEntry[]; asks: OrderBookEntry[] }>({
    bids: [],
    asks: [],
  });
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Keep track of the active socket to ensure we only close the right one
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 2. Define streams
    const s = symbol.toLowerCase();
    const streams = [
      `${s}@kline_1m`,
      `${s}@trade`,
      `${s}@depth20@100ms`,
    ];

    // 3. Create URL
    const streamUrl = `${WS_BASE_URL}/stream?streams=${streams.join('/')}`;
    console.log("🔌 Connecting to:", streamUrl);

    const ws = new WebSocket(streamUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ Connected:', symbol);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      // Safety: If this socket was supposedly closed, ignore messages
      if (ws !== wsRef.current) return;

      try {
        const message = JSON.parse(event.data);
        const data = message.data;
        if (!data) return;

        // --- Handle Klines ---
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
            const last = prev[prev.length - 1];
            if (last && last.time === newCandle.time) {
              const updated = [...prev];
              updated[updated.length - 1] = newCandle;
              return updated;
            }
            return [...prev.slice(-499), newCandle];
          });
          setCurrentPrice(kline.c);
        }

        // --- Handle Trades ---
        if (data.e === 'trade') {
           setRecentTrades((prev) => [{
             id: data.t,
             price: data.p,
             qty: data.q,
             time: data.T,
             isBuyerMaker: data.m,
           }, ...prev.slice(0, 49)]);
        }

        // --- Handle Orderbook ---
        if (data.bids && data.asks) {
           setOrderBook({
             bids: data.bids.map((b: string[]) => ({ price: b[0], quantity: b[1] })),
             asks: data.asks.map((a: string[]) => ({ price: a[0], quantity: a[1] }))
           });
        }

      } catch (err) {
        console.error("Parse error", err);
      }
    };

    ws.onclose = () => {
      console.log('❌ Disconnected:', symbol);
      if (ws === wsRef.current) setIsConnected(false);
    };

    // 4. Cleanup Function (Crucial for React Strict Mode)
    return () => {
      console.log('🧹 Cleaning up socket:', symbol);
      ws.close();
      if (wsRef.current === ws) wsRef.current = null;
    };
  }, [symbol]); // Only re-run if symbol changes

  return { klineData, currentPrice, recentTrades, orderBook, isConnected };
}