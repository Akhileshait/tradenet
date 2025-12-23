'use client';

import { memo, useEffect, useState } from 'react';
import { Wallet, Loader2 } from 'lucide-react';
import { useBinanceAPI } from '@/hooks/useBinanceAPI';
import { Balance } from '@/types';
import { formatPrice } from '@/lib/utils';

const PositionTable = memo(function PositionTable() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const { fetchAccountInfo, loading } = useBinanceAPI();

  useEffect(() => {
    loadBalances();
    const interval = setInterval(loadBalances, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadBalances = async () => {
    const result = await fetchAccountInfo();
    if (result) {
      const nonZeroBalances = result.balances.filter(
        (b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0
      );
      setBalances(nonZeroBalances);
    }
  };

  return (
    <div className="bg-dark-surface rounded-lg border border-dark-border">
      <div className="p-4 border-b border-dark-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-accent-blue" />
          <h3 className="text-sm font-semibold text-white">Balances</h3>
        </div>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
      </div>

      {balances.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">
          No balances found. Configure API keys in Settings.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-bg">
              <tr className="text-gray-400">
                <th className="px-4 py-3 text-left font-medium">Asset</th>
                <th className="px-4 py-3 text-right font-medium">Free</th>
                <th className="px-4 py-3 text-right font-medium">Locked</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((balance) => {
                const free = parseFloat(balance.free);
                const locked = parseFloat(balance.locked);
                const total = free + locked;

                return (
                  <tr
                    key={balance.asset}
                    className="border-t border-dark-border hover:bg-dark-hover transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">{balance.asset}</td>
                    <td className="px-4 py-3 text-right text-gray-400">
                      {formatPrice(free, 8)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400">
                      {formatPrice(locked, 8)}
                    </td>
                    <td className="px-4 py-3 text-right text-white font-medium">
                      {formatPrice(total, 8)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

export default PositionTable;