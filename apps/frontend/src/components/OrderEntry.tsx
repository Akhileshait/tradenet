'use client';

import { useState, memo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useBinanceAPI } from '@/hooks/useBinanceAPI';
import { OrderType, OrderSide } from '@/types';
import { cn, formatPrice, getSymbolPrecision } from '@/lib/utils';

interface OrderEntryProps {
  symbol: string;
  currentPrice: string;
  onOrderPlaced?: () => void;
}

const OrderEntry = memo(function OrderEntry({
  symbol,
  currentPrice,
  onOrderPlaced,
}: OrderEntryProps) {
  const [orderType, setOrderType] = useState<OrderType>('LIMIT');
  const [side, setSide] = useState<OrderSide>('BUY');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { submitOrder, error } = useBinanceAPI();
  const precision = getSymbolPrecision(symbol);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      const orderParams = {
        symbol,
        side,
        type: orderType,
        quantity,
        ...(orderType !== 'MARKET' && { price }),
        ...(orderType === 'STOP_LOSS_LIMIT' && { stopPrice }),
      };

      const result = await submitOrder(orderParams);

      setIsSubmitting(false);

      if (result) {
        setPrice('');
        setQuantity('');
        setStopPrice('');
        onOrderPlaced?.();
      }
    },
    [symbol, side, orderType, quantity, price, stopPrice, submitOrder, onOrderPlaced]
  );

  const calculateTotal = () => {
    const priceValue =
      orderType === 'MARKET' ? parseFloat(currentPrice) : parseFloat(price);
    const qtyValue = parseFloat(quantity);
    if (isNaN(priceValue) || isNaN(qtyValue)) return '0.00';
    return formatPrice(priceValue * qtyValue, 2);
  };

  return (
    <div className="bg-dark-surface rounded-lg p-4 border border-dark-border h-fit">
      {/* BUY / SELL */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSide('BUY')}
          className={cn(
            'flex-1 py-2 rounded-lg font-medium transition-all',
            side === 'BUY'
              ? 'bg-accent-green text-white'
              : 'bg-dark-bg text-gray-400 hover:text-white'
          )}
        >
          Buy
        </button>

        <button
          onClick={() => setSide('SELL')}
          className={cn(
            'flex-1 py-2 rounded-lg font-medium transition-all',
            side === 'SELL'
              ? 'bg-accent-red text-white'
              : 'bg-dark-bg text-gray-400 hover:text-white'
          )}
        >
          Sell
        </button>
      </div>

      {/* ORDER TYPE */}
      <div className="flex gap-1 mb-4 bg-dark-bg rounded-lg p-1">
        {(['LIMIT', 'MARKET', 'STOP_LOSS_LIMIT'] as OrderType[]).map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={cn(
              'flex-1 py-1.5 rounded text-sm font-medium transition-all',
              orderType === type
                ? 'bg-dark-surface text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            {type === 'STOP_LOSS_LIMIT' ? 'Stop' : type}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {orderType !== 'MARKET' && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Price (USDT)</label>
            <input
              type="number"
              step={`0.${'0'.repeat(precision.price - 1)}1`}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-blue"
              placeholder={formatPrice(currentPrice, precision.price)}
              required
            />
          </div>
        )}

        {orderType === 'STOP_LOSS_LIMIT' && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Stop Price (USDT)
            </label>
            <input
              type="number"
              step={`0.${'0'.repeat(precision.price - 1)}1`}
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-blue"
              placeholder="Stop price"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Quantity ({symbol.replace('USDT', '')})
          </label>
          <input
            type="number"
            step={`0.${'0'.repeat(precision.quantity - 1)}1`}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-blue"
            placeholder="0.00"
            required
          />
        </div>

        <div className="flex gap-2">
          {[25, 50, 75, 100].map((percent) => (
            <button
              key={percent}
              type="button"
              className="flex-1 py-1 text-xs bg-dark-bg hover:bg-dark-hover rounded text-gray-400 hover:text-white transition-colors"
            >
              {percent}%
            </button>
          ))}
        </div>

        <div className="pt-2 border-t border-dark-border">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-400">Total</span>
            <span className="text-white font-medium">
              {calculateTotal()} USDT
            </span>
          </div>

          {error && (
            <div className="mb-3 p-2 bg-accent-red/10 border border-accent-red/20 rounded text-xs text-accent-red">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2',
              side === 'BUY'
                ? 'bg-accent-green hover:bg-accent-green/90'
                : 'bg-accent-red hover:bg-accent-red/90',
              'text-white disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {side === 'BUY' ? 'Buy' : 'Sell'} {symbol.replace('USDT', '')}
          </button>
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        <p>⌘/Ctrl + B: Quick Buy</p>
        <p>⌘/Ctrl + S: Quick Sell</p>
      </div>
    </div>
  );
});

export default OrderEntry;