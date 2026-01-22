import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  typescript: {
    // Ignora erros de tipo durante o build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora erros do ESLint durante o build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
