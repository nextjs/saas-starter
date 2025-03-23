import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone', // Enable standalone output for Docker deployment
  async redirects() {
    return [
      {
        source: "/sign-up",
        destination: "/login",
        permanent: true
      },
    ];
  },
};

export default nextConfig;
