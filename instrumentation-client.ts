import posthog from 'posthog-js';

posthog.init(process.env.NODE_ENV !== 'development' ? process.env.NEXT_PUBLIC_POSTHOG_KEY! : '', {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: '2025-05-24',
});
