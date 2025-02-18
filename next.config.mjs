/** @type {import('next').NextConfig} */
const nextConfig = {
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
