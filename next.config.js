/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use 'standalone' output only for Docker/self-hosted deployments
  // Vercel doesn't need standalone mode (uses serverless functions)
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
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

