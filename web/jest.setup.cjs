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

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
