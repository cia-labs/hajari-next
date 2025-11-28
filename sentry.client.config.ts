// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Check if Sentry should be enabled (match your other app's approach)
const shouldEnableSentry =
  process.env.NEXT_PUBLIC_SENTRY_DISABLED !== "true" &&
  process.env.NODE_ENV !== "development" &&
  typeof window !== "undefined";

if (shouldEnableSentry) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Add optional integrations for additional features
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Define how likely traces are sampled.
    tracesSampleRate: 1,

    // Define how likely Replay events are sampled.
    replaysSessionSampleRate: 0.1,

    // Define how likely Replay events are sampled when an error occurs.
    replaysOnErrorSampleRate: 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: process.env.NEXT_PUBLIC_SENTRY_DEBUG === "true",
  });
} else {
  console.log("Sentry client initialization skipped");
}

