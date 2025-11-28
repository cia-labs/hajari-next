// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Check if Sentry should be enabled (keep same approach as your other app)
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
  console.log("Sentry server initialization skipped");
}
