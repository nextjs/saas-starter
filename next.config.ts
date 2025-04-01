import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true
  },
  async redirects() {
    return [
      {
        source: "/", // 旧路径
        destination: "/home", // 新路径
        permanent: true, // true = 301 永久重定向, false = 302 临时重定向
      }
    ];
  },
};

export default nextConfig;
