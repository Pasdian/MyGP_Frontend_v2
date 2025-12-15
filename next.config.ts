import pkg from './package.json' assert { type: 'json' };

const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '20mb' },
  },
  env: {
    NEXT_PUBLIC_RELEASE_VERSION: pkg.version,
    NEXT_PUBLIC_PYTHON_API_KEY: process.env.NEXT_PUBLIC_PYTHON_API_KEY,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  output: 'standalone',
};

export default nextConfig;
