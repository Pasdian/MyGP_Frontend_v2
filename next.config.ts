import pkg from './package.json' assert { type: 'json' };

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  env: {
    NEXT_PUBLIC_RELEASE_VERSION: pkg.version, // bump only on big changes
  },
};

export default nextConfig;
