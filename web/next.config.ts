import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Enable environment variable validation in development
  env: {
    CUSTOM_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_ERROR_CONTACT_EMAIL: process.env.NEXT_ERROR_CONTACT_EMAIL,
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
