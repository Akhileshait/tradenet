import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

// Use Inter as a reliable, built-in Google font to avoid Geist resolution errors
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TradeNet",
  description:
    "Real-time cryptocurrency trading platform using Binance Testnet API. Trade BTC, ETH, and more with live charts and order management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
