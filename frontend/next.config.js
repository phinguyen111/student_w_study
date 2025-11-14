/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only use standalone output for production builds (Vercel)
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  images: {
    domains: [],
    unoptimized: false,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
}

module.exports = nextConfig



