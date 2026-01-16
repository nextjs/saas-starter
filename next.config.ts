import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    cacheComponents: true,
    clientSegmentCache: true,
      ppr: true,
  }
};

export default nextConfig;
