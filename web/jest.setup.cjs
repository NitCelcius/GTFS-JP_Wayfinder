// Jest setup file
// Add custom matchers or global test setup here

// Import jest-dom matchers
require("@testing-library/jest-dom");

// Mock environment variables for testing
process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8002";
