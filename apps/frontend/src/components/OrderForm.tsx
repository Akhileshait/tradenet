"use client";
import { useState } from 'react';

export const OrderForm = () => {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = async () => {
     alert(`Placing ${side} order for ${quantity}`);
  };

  return (
    <div className="p-4 bg-[#1e2329] text-white w-80 flex flex-col gap-4">
      <div className="flex bg-[#0b0e11] rounded p-1">
        <button 
          onClick={() => setSide('BUY')}
          className={`flex-1 py-2 rounded text-sm font-bold ${side === 'BUY' ? 'bg-green-500 text-white' : 'text-gray-400'}`}
        >
          Buy
        </button>
        <button 
          onClick={() => setSide('SELL')}
          className={`flex-1 py-2 rounded text-sm font-bold ${side === 'SELL' ? 'bg-red-500 text-white' : 'text-gray-400'}`}
        >
          Sell
        </button>
      </div>
      <div>
        <label className="text-xs text-gray-400">Quantity</label>
        <div className="flex bg-[#2b3139] border border-gray-700 rounded mt-1">
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-transparent p-2 outline-none"
              placeholder="0.00"
            />
            <span className="p-2 text-gray-500 text-sm">BTC</span>
        </div>
      </div>
      <button 
        onClick={handleSubmit}
        className={`w-full py-3 rounded font-bold mt-4 ${side === 'BUY' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
      >
        {side} BTC
      </button>
    </div>
  );
};