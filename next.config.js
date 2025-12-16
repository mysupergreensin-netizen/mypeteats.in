/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use 'standalone' output only for Docker/self-hosted deployments
  // Vercel doesn't need standalone mode (uses serverless functions)
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    APP_ADMIN_TOKEN: process.env.APP_ADMIN_TOKEN,
    JWT_SECRET: process.env.JWT_SECRET,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  },
  images: {
    // Allow external image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
    ],
    // Enable image optimization
    formats: ['image/avif', 'image/webp'],
    // Allow local images (relative paths starting with /)
    unoptimized: false,
  },
}

module.exports = nextConfig

