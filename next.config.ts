import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfkit'],
  experimental: {
    ppr: true,
    clientSegmentCache: true
  }
};

export default nextConfig;
