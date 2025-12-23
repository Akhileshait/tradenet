'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import TradingChart from '@/components/TradingChart';
import OrderEntry from '@/components/OrderEntry';
import OrderBook from '@/components/OrderBook';
import RecentTrades from '@/components/RecentTrades';
import OpenOrders from '@/components/OpenOrders';
import PositionTable from '@/components/PositionTable';
import { useTradeWebSocket } from '@/hooks/useTradeWebSocket';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Activity } from 'lucide-react';

export default function TradePage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();
  const [refreshOrders, setRefreshOrders] = useState(0);

  const { klineData, currentPrice, recentTrades, orderBook, isConnected } =
    useTradeWebSocket(symbol);

  const handleOrderPlaced = useCallback(() => {
    setRefreshOrders((prev) => prev + 1);
  }, []);

  useKeyboardShortcuts({
    onBuy: () => console.log('Buy shortcut'),
    onSell: () => console.log('Sell shortcut'),
    onCancel: () => console.log('Cancel shortcut'),
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 px-4 py-2 bg-dark-surface rounded-lg border border-dark-border w-fit">
        <Activity
          className={`w-4 h-4 ${
            isConnected ? 'text-accent-green animate-pulse' : 'text-gray-500'
          }`}
        />
        <span className="text-sm text-gray-400">
          {isConnected ? 'Connected' : 'Connecting...'}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-3">
          <OrderEntry
            symbol={symbol}
            currentPrice={currentPrice}
            onOrderPlaced={handleOrderPlaced}
          />
        </div>

        <div className="xl:col-span-6">
          <TradingChart data={klineData} symbol={symbol} />
        </div>

        <div className="xl:col-span-3 space-y-4">
          <OrderBook bids={orderBook.bids} asks={orderBook.asks} />
          <RecentTrades trades={recentTrades} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <OpenOrders symbol={symbol} refreshTrigger={refreshOrders} />
        <PositionTable />
      </div>
    </div>
  );
}