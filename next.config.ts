import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development", // Disable PWA in dev to avoid aggressive caching
});

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Standalone output for Docker/deployment (produces .next/standalone/)
  output: "standalone",
  turbopack: {},
  images: {
    qualities: [75, 85],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'date-fns', 'recharts', 'embla-carousel-react', '@radix-ui/react-icons'],
  },
};

export default withSerwist(nextConfig);
