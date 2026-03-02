import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ["*.crm.orangeleaf.nl", "localhost:3000"] },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.microsoftonline.com" },
      { protocol: "https", hostname: "**.google.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
