"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Settings } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { cn } from "@/lib/utils";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "ADAUSDT"];

export default function Header() {
  const pathname = usePathname();
  const currentSymbol = pathname.split("/")[2] || "BTCUSDT";

  return (
    <header className="bg-dark-surface dark:bg-dark-surface border-b border-dark-border sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <TrendingUp className="w-6 h-6 text-accent-blue" />
            <span className="bg-gradient-to-r from-accent-blue to-accent-green bg-clip-text text-transparent">
              TradeNet
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {SYMBOLS.map((symbol) => (
              <Link
                key={symbol}
                href={`/trade/${symbol}`}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  currentSymbol === symbol
                    ? "bg-dark-hover text-white"
                    : "text-gray-400 hover:text-white hover:bg-dark-hover/50"
                )}
              >
                {symbol.replace("USDT", "/USDT")}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/settings"
            className="p-2 rounded-lg hover:bg-dark-hover transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}
