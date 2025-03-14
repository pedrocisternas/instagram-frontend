/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'scontent.fscl13-2.fna.fbcdn.net',   // Facebook/Instagram CDN domain from the error
      'scontent.cdninstagram.com',          // Common Instagram CDN domain
      'scontent-mia3-1.cdninstagram.com',   // Another Instagram CDN domain pattern
      'scontent-mia3-2.cdninstagram.com',
      'instagram.fscl13-1.fna.fbcdn.net',   // Another common pattern
      'instagram.fscl13-2.fna.fbcdn.net',
      'graph.facebook.com',                 // Graph API profile pictures
      'platform-lookaside.fbsbx.com',       // Facebook profile pictures
      'scontent.xx.fbcdn.net',              // General Facebook CDN
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
        pathname: '**',
      },
    ],
  },
  async rewrites() {
    // Si no existe la variable de ambiente, el servicio no funcionará
    // lo cual es preferible a exponer URLs en el código
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl) {
      console.warn('WARNING: NEXT_PUBLIC_API_URL is not defined');
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`
      },
      {
        source: '/auth/:path*',
        destination: `${apiUrl}/auth/:path*`
      }
    ]
  }
};

export default nextConfig;
