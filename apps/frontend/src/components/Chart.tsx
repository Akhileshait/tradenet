"use client";

import { useEffect, useRef, memo } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  CandlestickSeries,
} from "lightweight-charts";
import { KlineData } from "@/types";
import { UTCTimestamp } from "lightweight-charts";

interface TradingChartProps {
  data: KlineData[];
  symbol: string;
}

const TradingChart = memo(function TradingChart({
  data,
  symbol,
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

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

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#0ECB81",
      downColor: "#F6465D",
      borderUpColor: "#0ECB81",
      borderDownColor: "#F6465D",
      wickUpColor: "#0ECB81",
      wickDownColor: "#F6465D",
    });

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

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      const formattedData = data.map((d) => ({
        time: (d.time / 1000) as UTCTimestamp,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      seriesRef.current.setData(formattedData);
    }
  }, [data]);

  return (
    <div className="bg-dark-surface rounded-lg p-4 border border-dark-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">{symbol}</h2>
        <div className="flex gap-2">
          {["1m", "5m", "15m", "1h", "4h", "1d"].map((interval) => (
            <button
              key={interval}
              className={cn(
                "px-3 py-1 text-xs rounded transition-colors",
                interval === "1m"
                  ? "bg-accent-blue text-white"
                  : "text-gray-400 hover:text-white hover:bg-dark-hover"
              )}
            >
              {interval}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
});

export default TradingChart;

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
