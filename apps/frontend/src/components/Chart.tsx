"use client";

import { useEffect, useRef, memo, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  CandlestickSeries,
  UTCTimestamp,
} from "lightweight-charts";

// Utility to combine classes
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface TradingChartProps {
  symbol: string;
}

const TradingChart = memo(function TradingChart({ symbol }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // 1. Internal State for Interval (defaults to 1h)
  const [interval, setInterval] = useState("1h");

  // 2. Initialize Chart (Run once)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0B0E11" },
        textColor: "#9CA3AF",
      },
      grid: {
        vertLines: { color: "#1E2329" },
        horzLines: { color: "#1E2329" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#1E2329",
      },
      rightPriceScale: {
        borderColor: "#1E2329",
      },
    });

    // Add Series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#0ECB81",
      downColor: "#F6465D",
      borderUpColor: "#0ECB81",
      borderDownColor: "#F6465D",
      wickUpColor: "#0ECB81",
      wickDownColor: "#F6465D",
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // 3. Fetch Data when Interval or Symbol changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!seriesRef.current) return;

      try {
        // Use the Proxy to avoid CORS
        const res = await fetch(
          `/binance-proxy/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000`
        );
        const data = await res.json();

        // Format data for Lightweight Charts
        const formattedData = data.map((d: (string | number)[]) => ({
          time: ((d[0] as number) / 1000) as UTCTimestamp,
          open: parseFloat(d[1] as string),
          high: parseFloat(d[2] as string),
          low: parseFloat(d[3] as string),
          close: parseFloat(d[4] as string),
        }));

        seriesRef.current.setData(formattedData);
      } catch (err) {
        console.error("Failed to fetch chart data:", err);
      }
    };

    fetchHistory();

    // NOTE: If you are using the WebSocket hook for live updates,
    // you would pass `interval` to it so it matches this chart.
  }, [symbol, interval]);

  return (
    <div className="bg-[#161A1E] rounded-lg p-4 border border-[#1E2329]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">{symbol} Chart</h2>

        {/* Interval Buttons */}
        <div className="flex gap-2">
          {["1m", "5m", "15m", "1h", "4h", "1d"].map((t) => (
            <button
              key={t}
              onClick={() => setInterval(t)} // <--- This now updates the state
              className={cn(
                "px-3 py-1 text-xs rounded transition-colors font-medium",
                interval === t // <--- Checks actual state
                  ? "bg-[#3861FB] text-white" // Active Blue
                  : "text-gray-400 hover:text-white hover:bg-[#2B3139]"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div ref={chartContainerRef} className="w-full h-[500px]" />
    </div>
  );
});

export default TradingChart;
