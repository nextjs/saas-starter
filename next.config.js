/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure CSP for both development and production
  headers: async () => {
    // In development, don't set any CSP headers
    if (process.env.NODE_ENV === 'development') {
      return [];
    }
    
    // In production, set secure CSP headers
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.supabase.co; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src 'self' https://*.supabase.co;"
          }
        ]
      }
    ];
  }
}

module.exports = nextConfig 