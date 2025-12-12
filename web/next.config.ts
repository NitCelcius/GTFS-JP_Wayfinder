import type { NextConfig } from "next";

// Validate API base URL at build time
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const isProduction = process.env.NODE_ENV === "production";

if (!apiBaseUrl && isProduction) {
  console.warn(
    "\n⚠️  WARNING: NEXT_PUBLIC_API_BASE_URL is not set!\n" +
      "   Production build will default to http://localhost:8002\n" +
      "   Please set NEXT_PUBLIC_API_BASE_URL in your environment variables.\n"
  );
} else if (apiBaseUrl) {
  const isLocalhost =
    apiBaseUrl.includes("localhost") || apiBaseUrl.includes("127.0.0.1");
  if (isProduction && isLocalhost) {
    console.error(
      "\n❌ ERROR: API is configured to use localhost in production build!\n" +
        `   NEXT_PUBLIC_API_BASE_URL = ${apiBaseUrl}\n` +
        "   This will cause API requests to fail in production.\n" +
        "   Please update NEXT_PUBLIC_API_BASE_URL to your production API URL.\n"
    );
  } else {
    console.log(`\n✅ API Base URL: ${apiBaseUrl}\n`);
  }
}

const nextConfig: NextConfig = {
  /* config options here */

  // Enable environment variable validation in development
  env: {
    CUSTOM_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },

  // Add helpful logging for API base URL in development
  ...(process.env.NODE_ENV === "development" && {
    webpack: (config, { dev }) => {
      if (dev) {
        console.log(
          `🚀 API Base URL: ${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8002 (default)"}`
        );
      }
      return config;
    },
  }),
};

export default nextConfig;
