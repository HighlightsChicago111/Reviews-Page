import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  basePath: '/reviews',
  turbopack: {root: process.cwd()},
  async redirects() {
    return [
      {
        source: '/',
        destination: '/reviews',
        permanent: false,
        basePath: false,
      },
    ]
  },
}

export default nextConfig
