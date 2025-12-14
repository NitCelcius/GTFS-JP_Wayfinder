/**
 * Initialize generated API client at app startup.
 *
 * This ensures the client's baseUrl is set as early as possible (module
 * evaluation time) so that there is no race between created clients with an
 * empty config and subsequent setConfig calls. This prevents the generated
 * client from using a relative URL (which would cause requests to target the
 * same origin, e.g. localhost:3000) if the real base URL is not configured
 * yet at the time of the request.
 */
import { client as generatedClient } from "@/api/client.gen";

import { getEnvValue } from "./envUtils";

const baseUrl = getEnvValue("NEXT_PUBLIC_API_BASE_URL");
if (!baseUrl) {
  throw new Error(
    "[initializeApiClient] NEXT_PUBLIC_API_BASE_URL is not configured"
  );
}
// Set base URL immediately so any code that uses the generated client directly
// (rather than going through our `ApiClient` wrapper) has a proper config.
generatedClient.setConfig({ baseUrl });

// Helpful debug output to verify value at runtime
if (typeof window !== "undefined") {
  console.debug("[initApiClient] configured generatedClient baseUrl:", baseUrl);
} else {
  console.debug(
    "[initApiClient] (server) configured generatedClient baseUrl:",
    baseUrl
  );
}

export { baseUrl };
