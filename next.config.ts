import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: false,
  },
  images: {
    unoptimized: true,
  },
  output: "standalone", // Enable standalone output for Docker deployment
  async redirects() {
    return [
      {
        source: "/sign-up",
        destination: "/sign-in",
        permanent: true,
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      // Disable source maps in production for faster builds
      config.devtool = false;
    }
    return config;
  },
};

export default nextConfig;
