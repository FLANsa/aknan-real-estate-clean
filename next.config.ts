import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'aknanalkimma-1d85c.firebasestorage.app',
        pathname: '/**',
      },
    ],
    // السماح بعرض الصور المحلية
    unoptimized: false,
    // إضافة مسارات محلية للصور
    domains: ['localhost'],
  },
};

export default nextConfig;
