import pkg from './package.json' assert { type: 'json' };

const isDev = process.env.NODE_ENV === 'development' || process.env.APP_ENV === 'development';

const nextConfig = {
  allowedDevOrigins: isDev ? ['localhost', '*.localhost', '**.localhost', '127.0.0.1', '*.*.*.*'] : undefined,
  headers: async () =>
    isDev
      ? [
          {
            source: '/:path*',
            headers: [
              { key: 'Access-Control-Allow-Origin', value: '*' },
              { key: 'Access-Control-Allow-Methods', value: '*' },
              { key: 'Access-Control-Allow-Headers', value: '*' },
            ],
          },
        ]
      : [],
  experimental: {
    serverActions: { bodySizeLimit: '20mb' },
    webpackBuildWorker: true,
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,
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
