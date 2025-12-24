"use client";

import { memo, useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useBinanceAPI } from "@/hooks/useBinanceAPI";
import { Order } from "@/types";
import { formatPrice, formatTime, cn } from "@/lib/utils";

interface OpenOrdersProps {
  symbol?: string;
  refreshTrigger?: number;
}

const OpenOrders = memo(function OpenOrders({
  symbol,
  refreshTrigger,
}: OpenOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const { fetchOpenOrders, removeOrder, loading } = useBinanceAPI();

  const loadOrders = async () => {
    const result = await fetchOpenOrders(symbol);
    if (result) {
      setOrders(result);
    }
  };

  useEffect(() => {
    (async () => {
      await loadOrders();
    })();
  }, [symbol, refreshTrigger]);

  const handleCancelOrder = async (orderId: number, orderSymbol: string) => {
    const result = await removeOrder(orderSymbol, orderId);
    if (result) {
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    }
  };

  return (
    <div className="bg-dark-surface rounded-lg border border-dark-border">
      <div className="p-4 border-b border-dark-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Open Orders</h3>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
      </div>

      {orders.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">
          No open orders
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-bg">
              <tr className="text-gray-400">
                <th className="px-4 py-3 text-left font-medium">Time</th>
                <th className="px-4 py-3 text-left font-medium">Symbol</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Side</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-right font-medium">Filled</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-center font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.orderId}
                  className="border-t border-dark-border hover:bg-dark-hover transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400">
                    {formatTime(order.time)}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    {order.symbol}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{order.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "font-medium",
                        order.side === "BUY"
                          ? "text-accent-green"
                          : "text-accent-red"
                      )}
                    >
                      {order.side}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white">
                    {formatPrice(order.price, 2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">
                    {parseFloat(order.origQty).toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">
                    {parseFloat(order.executedQty).toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-accent-blue/10 text-accent-blue rounded text-xs">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() =>
                        handleCancelOrder(order.orderId, order.symbol)
                      }
                      className="p-1 hover:bg-accent-red/10 rounded transition-colors group"
                      title="Cancel order"
                    >
                      <X className="w-4 h-4 text-gray-400 group-hover:text-accent-red" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

export default OpenOrders;
