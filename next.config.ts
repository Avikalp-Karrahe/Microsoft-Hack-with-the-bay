import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    rules: {
      '*.py': {
        loaders: ['ignore-loader'],
      },
    },
  },
  // Exclude backend directory from build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Exclude backend directory
        '@/backend': false,
      };
    }
    return config;
  },
};

export default nextConfig;
