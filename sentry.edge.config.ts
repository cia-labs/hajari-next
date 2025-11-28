// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Check if Sentry should be enabled (same approach as other app)
const shouldEnableSentry =
  process.env.SENTRY_DISABLED !== "true" &&
  process.env.NODE_ENV !== "development";

if (shouldEnableSentry) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // Define how likely traces are sampled.
    tracesSampleRate: 1,

    // Keep debug off unless explicitly enabled
    debug: process.env.SENTRY_DEBUG === "true",
  });
} else {
  console.log("Sentry edge initialization skipped");
}
