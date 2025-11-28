/** @type {import('next').NextConfig} */
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  output: "standalone",
  env: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
  },
  reactStrictMode: true,
  experimental: { serverActions: {} },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // No manual rewrites needed for Sentry tunnel; SDK handles the tunnel route
};

export default withSentryConfig(
  nextConfig,
);
