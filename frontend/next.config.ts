// next.config.js
module.exports = {
  images: {
    domains: ['res.cloudinary.com', 'i.pinimg.com'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
  // Otimizações de streaming
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  // Compressão
  compress: true,
  // Headers de cache
  async headers() {
    return [
      {
        source: '/:path*.mp4',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}