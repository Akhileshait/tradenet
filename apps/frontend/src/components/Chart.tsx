"use client";
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  CandlestickSeries // <--- IMPORT THIS
} from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

export const Chart = ({ symbol }: { symbol: string }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // Note: Reference type is specific to CandlestickSeries
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 1. Create Chart
    const chart = createChart(chartContainerRef.current, {
      layout: { 
        background: { type: ColorType.Solid, color: '#161A25' }, 
        textColor: '#D9D9D9',
      },
      grid: { 
        vertLines: { color: '#2B2B43' }, 
        horzLines: { color: '#2B2B43' } 
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });

    // 2. Add Series (New v5 Syntax)
    // Old: chart.addCandlestickSeries(...) -> REMOVED
    // New: chart.addSeries(CandlestickSeries, options)
    const newSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a', 
      downColor: '#ef5350', 
      borderVisible: false, 
      wickUpColor: '#26a69a', 
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    seriesRef.current = newSeries;

    // 3. Fetch Historical Data
    fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=1000`)
      .then(r => r.json())
      .then(data => {
        const cdata = data.map((d: any) => ({
          time: d[0] / 1000,
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }));
        newSeries.setData(cdata);
      })
      .catch(err => console.error("Data Fetch Error:", err));

    // 4. Connect to WebSocket
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1h`);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const candle = message.k;
      newSeries.update({
        time: candle.t / 1000,
        open: parseFloat(candle.o),
        high: parseFloat(candle.h),
        low: parseFloat(candle.l),
        close: parseFloat(candle.c),
      });
    };

    const handleResize = () => {
        if (chartContainerRef.current) {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ws.close();
      chart.remove();
    };
  }, [symbol]);

  return <div ref={chartContainerRef} className="w-full h-[500px]" />;
};