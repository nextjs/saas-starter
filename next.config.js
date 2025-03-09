/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost'],
      bodySizeLimit: '2mb'
    }
  }
};

module.exports = nextConfig; 