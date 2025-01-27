/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/callback',
          destination: '/callback/page'
        }
      ];
    }
  };
  
  export default nextConfig;