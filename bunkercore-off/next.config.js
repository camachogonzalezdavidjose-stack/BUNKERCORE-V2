/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Deshabilita el caché en disco de Webpack para evitar snapshots corruptos en Termux
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
