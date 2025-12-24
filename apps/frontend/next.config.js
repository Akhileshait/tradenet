/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Turn off strict mode to reduce socket double-connections
  async rewrites() {
    return [
      {
        // 1. When frontend calls '/binance-proxy/...'
        source: "/binance-proxy/:path*",
        // 2. Next.js forwards it to Binance
        destination: "https://testnet.binance.vision/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
