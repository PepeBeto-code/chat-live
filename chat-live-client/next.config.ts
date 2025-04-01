// next.config.ts
import { apiUrl } from '@/Variables/ApiVariables.mjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: `${apiUrl}/auth/:path*`, // Redirige todas las solicitudes que comienzan con /api/ al servidor backend
      },
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`, // Redirige todas las solicitudes que comienzan con /api/ al servidor backend
      },
      {
        source: '/chat-websocket/:path*',
        destination: `${apiUrl}/chat-websocket/:path*`, // Reescribe para WebSocket
      },
    ];
  },
};

export default nextConfig;
