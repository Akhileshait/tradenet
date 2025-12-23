'use client';

import { memo } from 'react';
import { Trade } from '@/types';
import { formatPrice, formatTime, cn } from '@/lib/utils';

interface RecentTradesProps {
  trades: Trade[];
}

const TradeRow = memo(function TradeRow({ trade }: { trade: Trade }) {
  return (
    <div className="flex justify-between text-xs py-1.5 hover:bg-dark-hover/50 transition-colors">
      <span
        className={cn(
          'font-medium',
          trade.isBuyerMaker ? 'text-accent-red' : 'text-accent-green'
        )}
      >
        {formatPrice(trade.price, 2)}
      </span>
      <span className="text-gray-400">{parseFloat(trade.qty).toFixed(4)}</span>
      <span className="text-gray-500">{formatTime(trade.time)}</span>
    </div>
  );
});

const RecentTrades = memo(function RecentTrades({ trades }: RecentTradesProps) {
  return (
    <div className="bg-dark-surface rounded-lg border border-dark-border h-fit">
      <div className="p-4 border-b border-dark-border">
        <h3 className="text-sm font-semibold text-white">Recent Trades</h3>
      </div>

      <div className="px-3 py-2 flex justify-between text-xs text-gray-500 border-b border-dark-border">
        <span>Price (USDT)</span>
        <span>Amount</span>
        <span>Time</span>
      </div>

      <div className="h-[300px] overflow-y-auto px-3">
        {trades.map((trade) => (
          <TradeRow key={trade.id} trade={trade} />
        ))}
      </div>
    </div>
  );
});

export default RecentTrades;