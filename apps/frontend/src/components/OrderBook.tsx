'use client';

import { memo } from 'react';
import { OrderBookEntry } from '@/types';
import { formatPrice, cn } from '@/lib/utils';

interface OrderBookProps {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

const OrderBookRow = memo(function OrderBookRow({
  entry,
  type,
  maxTotal,
}: {
  entry: OrderBookEntry;
  type: 'bid' | 'ask';
  maxTotal: number;
}) {
  const price = parseFloat(entry.price);
  const quantity = parseFloat(entry.quantity);
  const total = price * quantity;
  const percentage = (total / maxTotal) * 100;

  return (
    <div className="relative h-6 flex items-center text-xs hover:bg-dark-hover/50 transition-colors">
      <div
        className={cn(
          'absolute right-0 h-full',
          type === 'bid' ? 'bg-accent-green/10' : 'bg-accent-red/10'
        )}
        style={{ width: `${percentage}%` }}
      />
      <div className="relative z-10 flex justify-between w-full px-3">
        <span className={type === 'bid' ? 'text-accent-green' : 'text-accent-red'}>
          {formatPrice(price, 2)}
        </span>
        <span className="text-gray-400">{quantity.toFixed(4)}</span>
        <span className="text-gray-500">{total.toFixed(2)}</span>
      </div>
    </div>
  );
});

const OrderBook = memo(function OrderBook({ bids, asks }: OrderBookProps) {
  const maxBidTotal = Math.max(
    ...bids.map((b) => parseFloat(b.price) * parseFloat(b.quantity))
  );
  const maxAskTotal = Math.max(
    ...asks.map((a) => parseFloat(a.price) * parseFloat(a.quantity))
  );

  const spread =
    asks.length > 0 && bids.length > 0
      ? parseFloat(asks[asks.length - 1].price) - parseFloat(bids[0].price)
      : 0;

  return (
    <div className="bg-dark-surface rounded-lg border border-dark-border h-fit">
      <div className="p-4 border-b border-dark-border">
        <h3 className="text-sm font-semibold text-white">Order Book</h3>
      </div>

      <div className="px-3 py-2 flex justify-between text-xs text-gray-500 border-b border-dark-border">
        <span>Price (USDT)</span>
        <span>Amount</span>
        <span>Total</span>
      </div>

      <div className="h-[300px] overflow-hidden">
        <div className="flex flex-col-reverse">
          {asks
            .slice(-10)
            .reverse()
            .map((ask, i) => (
              <OrderBookRow key={`ask-${i}`} entry={ask} type="ask" maxTotal={maxAskTotal} />
            ))}
        </div>

        <div className="px-3 py-2 bg-dark-bg flex items-center justify-between">
          <span className="text-lg font-semibold text-white">
            {bids.length > 0 ? formatPrice(bids[0].price, 2) : '0.00'}
          </span>
          <span className="text-xs text-gray-500">
            Spread: {formatPrice(spread, 2)} ({((spread / parseFloat(bids[0]?.price || '1')) * 100).toFixed(2)}%)
          </span>
        </div>

        <div>
          {bids.slice(0, 10).map((bid, i) => (
            <OrderBookRow key={`bid-${i}`} entry={bid} type="bid" maxTotal={maxBidTotal} />
          ))}
        </div>
      </div>
    </div>
  );
});

export default OrderBook;