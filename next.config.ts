import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['ruvector'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle ruvector on client — it's server-only
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
