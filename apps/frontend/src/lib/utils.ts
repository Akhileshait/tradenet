import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatPrice(price: string | number, decimals: number = 2): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return formatNumber(numPrice, decimals);
}

export function formatVolume(volume: string | number): string {
  const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
  if (numVolume >= 1000000) {
    return `${(numVolume / 1000000).toFixed(2)}M`;
  } else if (numVolume >= 1000) {
    return `${(numVolume / 1000).toFixed(2)}K`;
  }
  return numVolume.toFixed(2);
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
}

export function getSymbolPrecision(symbol: string): { price: number; quantity: number } {
  const precisionMap: Record<string, { price: number; quantity: number }> = {
    BTCUSDT: { price: 2, quantity: 5 },
    ETHUSDT: { price: 2, quantity: 4 },
    BNBUSDT: { price: 2, quantity: 3 },
    SOLUSDT: { price: 2, quantity: 3 },
    ADAUSDT: { price: 4, quantity: 2 },
  };
  return precisionMap[symbol] || { price: 2, quantity: 4 };
}