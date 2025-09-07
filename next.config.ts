import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Added for optimized Docker builds
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;