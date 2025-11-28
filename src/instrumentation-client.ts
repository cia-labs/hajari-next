// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

// Import the client init side-effect so it mirrors your other app's structure
import "../sentry.client.config";

// Re-export hook to track client routing
export { captureRouterTransitionStart as onRouterTransitionStart } from "@sentry/nextjs";