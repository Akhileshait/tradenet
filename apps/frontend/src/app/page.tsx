import { Chart } from "@/components/Chart";
import { OrderForm } from "@/components/OrderForm";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e11] text-gray-100 font-sans">
      <header className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-yellow-500 tracking-tight">
            DEX<span className="text-white">TRADER</span>
          </h1>
          <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-400">
            BTC/USDT
          </span>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-gray-800">
          <div className="flex-1 relative">
            <Chart symbol="BTCUSDT" />
          </div>
        </div>
        <div className="w-[320px] bg-[#1e2329]">
          <OrderForm />
        </div>
      </div>
    </div>
  );
}
