import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  
  allowedDevOrigins: ['192.168.0.10'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'media.formula1.com',
      },
      {
        protocol: 'https',
        hostname: '*.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '*.motorsport.com',
      },
      {
        protocol: 'https',
        hostname: 'objetos.estaticos-marca.com',
      },
      {
        protocol: 'https',
        hostname: '*.hearstapps.com',
      },
      {
        protocol: 'https',
        hostname: '*.f1technical.net',
      },
    ],
  },
};

export default nextConfig;
