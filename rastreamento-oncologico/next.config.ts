import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {

  // Fix para Turbopack detectar múltiplos lockfiles em monorepo
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Configurações de imagem
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Cabeçalhos de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ]
  },
}

export default nextConfig
