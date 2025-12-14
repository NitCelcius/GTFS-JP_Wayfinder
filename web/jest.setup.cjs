// Jest setup file
// Add custom matchers or global test setup here
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("@testing-library/jest-dom");

// Mock environment variables for testing
process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8002";
process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";

// Polyfill structuredClone for fake-indexeddb
if (!global.structuredClone) {
  global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}
