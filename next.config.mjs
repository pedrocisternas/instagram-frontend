/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*'
      },
      {
        source: '/auth/:path*',
        destination: 'http://localhost:3001/auth/:path*'
      }
    ]
  }
};

export default nextConfig;
