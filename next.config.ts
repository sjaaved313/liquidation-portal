import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Allow build even with ESLint errors (like 'any')
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow build even with type errors
    ignoreBuildErrors: true,
  },
  // experimental: {
  //   allowedDevOrigins: ['http://192.168.43.195:3000', 'http://localhost:3000'],
  // },
};

export default nextConfig;