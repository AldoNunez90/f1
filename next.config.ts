import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración de orígenes de desarrollo permitidos
  allowedDevOrigins: ['192.168.0.*'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '/**', // Permite cualquier subruta del CDN de banderas
      },
      {
        protocol: 'https',
        hostname: 'media.formula1.com',
        pathname: '/**', // Permite cualquier subruta de la web de F1
      },
      {
        protocol: 'https',
        hostname: '*.ytimg.com', // Servidores de miniatura de YouTube (ej. i.ytimg.com)
        pathname: '/**', // SÚPER CRÍTICO: Permite todas las carpetas y rutas internas
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com', // Servidor de respaldo que a veces usa la API de YT
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.motorsport.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'objetos.estaticos-marca.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.hearstapps.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.f1technical.net',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;