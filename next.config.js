/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
}

module.exports = module.exports = {
  experimental: {
    async headers() {
      return [
        {
          source: '/(.*)?',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*'
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET,HEAD,PUT,PATCH,POST,DELETE'
            },
          ]
        }
      ]
    },
    // temporary until https://github.com/zeit/next.js/pull/11755
    async rewrites() {
      return [
        {
          source: '/:path*',
          destination: '/:path*'
        }
      ]
    }
  }
}
