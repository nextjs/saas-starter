/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost'],
      bodySizeLimit: '2mb'
    }
  },
  async headers() {
    // Only apply CSP in production
    if (process.env.NODE_ENV === 'development') {
      return [];
    }

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.supabase.co; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src 'self' https://*.supabase.co;"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig; 