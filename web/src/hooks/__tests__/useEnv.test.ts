/* eslint-disable local/no-direct-env-access */
// Tests need direct access to process.env to verify the hook's behavior
import { renderHook } from "@testing-library/react";

import { useEnv, useEnvValue } from "../useEnv";

describe("useEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    // Set required env vars for tests
    process.env.NEXT_PUBLIC_API_BASE_URL ??= "http://localhost:8002";
    process.env.NEXT_PUBLIC_BASE_URL ??= "http://localhost:3000";
    // Clean up any injected window.__ENV__
    if (typeof window !== "undefined") {
      delete (
        window as Window & { __ENV__?: Record<string, string | undefined> }
      ).__ENV__;
    }
  });

  afterEach(() => {
    process.env = originalEnv;
    // Clean up any injected window.__ENV__
    if (typeof window !== "undefined") {
      delete (
        window as Window & { __ENV__?: Record<string, string | undefined> }
      ).__ENV__;
    }
  });

  describe("useEnv", () => {
    it("should return all environment variables with defaults", () => {
      const { result } = renderHook(() => useEnv());

      expect(result.current).toBeDefined();
      expect(result.current.NEXT_PUBLIC_API_BASE_URL).toBe(
        "http://localhost:8002"
      );
      expect(result.current.NEXT_PUBLIC_BASE_URL).toBeDefined();
      expect(result.current.NEXT_PUBLIC_USE_RELATIVE_TIME).toBe("false");
      // NODE_ENV is "test" during test runs
      expect(result.current.NODE_ENV).toBeDefined();
      expect(result.current.ENABLE_BASIC_AUTH).toBe("false");
    });

    it("should use process.env values when available", () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
      process.env.NEXT_PUBLIC_USE_RELATIVE_TIME = "true";

      const { result } = renderHook(() => useEnv());

      expect(result.current.NEXT_PUBLIC_API_BASE_URL).toBe(
        "https://api.example.com"
      );
      expect(result.current.NEXT_PUBLIC_USE_RELATIVE_TIME).toBe("true");
    });

    it("should prioritize window.__ENV__ over process.env", () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";

      // Mock window.__ENV__
      (
        window as Window & { __ENV__?: Record<string, string | undefined> }
      ).__ENV__ = {
        NEXT_PUBLIC_API_BASE_URL: "https://storybook.example.com",
      };

      const { result } = renderHook(() => useEnv());

      expect(result.current.NEXT_PUBLIC_API_BASE_URL).toBe(
        "https://storybook.example.com"
      );
    });
  });

  describe("useEnvValue", () => {
    it("should return specific environment variable", () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";

      const { result } = renderHook(() =>
        useEnvValue("NEXT_PUBLIC_API_BASE_URL")
      );

      expect(result.current).toBe("https://api.example.com");
    });

    it("should return default value when variable is not set", () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;

      expect(() => {
        renderHook(() => useEnvValue("NEXT_PUBLIC_API_BASE_URL"));
      }).toThrow("Missing required environment variable");
    });

    it("should use window.__ENV__ value when available", () => {
      // Mock window.__ENV__
      (
        window as Window & { __ENV__?: Record<string, string | undefined> }
      ).__ENV__ = {
        NEXT_PUBLIC_BASE_URL: "https://custom.example.com",
      };

      const { result } = renderHook(() => useEnvValue("NEXT_PUBLIC_BASE_URL"));

      expect(result.current).toBe("https://custom.example.com");
    });
  });

  describe("Environment variable precedence", () => {
    it("should follow the correct precedence order: window.__ENV__ > process.env > defaults", () => {
      // Set process.env
      process.env.NEXT_PUBLIC_USE_RELATIVE_TIME = "true";

      // First test: only process.env
      {
        const { result } = renderHook(() =>
          useEnvValue("NEXT_PUBLIC_USE_RELATIVE_TIME")
        );
        expect(result.current).toBe("true");
      }

      // Second test: window.__ENV__ should override process.env
      (
        window as Window & { __ENV__?: Record<string, string | undefined> }
      ).__ENV__ = {
        NEXT_PUBLIC_USE_RELATIVE_TIME: "false",
      };

      {
        const { result } = renderHook(() =>
          useEnvValue("NEXT_PUBLIC_USE_RELATIVE_TIME")
        );
        expect(result.current).toBe("false");
      }
    });
  });

  describe("Storybook compatibility", () => {
    it("should work in Storybook environment with window.__ENV__", () => {
      // Simulate Storybook environment
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      delete process.env.NEXT_PUBLIC_BASE_URL;

      (
        window as Window & { __ENV__?: Record<string, string | undefined> }
      ).__ENV__ = {
        NEXT_PUBLIC_API_BASE_URL: "http://localhost:8002",
        NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
        NEXT_PUBLIC_USE_RELATIVE_TIME: "false",
        NODE_ENV: "development",
      };

      const { result } = renderHook(() => useEnv());

      expect(result.current.NEXT_PUBLIC_API_BASE_URL).toBe(
        "http://localhost:8002"
      );
      expect(result.current.NEXT_PUBLIC_BASE_URL).toBe("http://localhost:3000");
      expect(result.current.NEXT_PUBLIC_USE_RELATIVE_TIME).toBe("false");
      expect(result.current.NODE_ENV).toBe("development");
    });
  });

  describe("Type safety", () => {
    it("should maintain non-nullable types for required env vars", () => {
      const { result } = renderHook(() => useEnv());

      // These should never be undefined (guaranteed by defaults)
      expect(typeof result.current.NEXT_PUBLIC_API_BASE_URL).toBe("string");
      expect(typeof result.current.NEXT_PUBLIC_BASE_URL).toBe("string");
      expect(typeof result.current.NEXT_PUBLIC_USE_RELATIVE_TIME).toBe(
        "string"
      );
      expect(typeof result.current.NODE_ENV).toBe("string");
      expect(typeof result.current.ENABLE_BASIC_AUTH).toBe("string");
    });

    it("should return typed values from useEnvValue with correct type inference", () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";

      const { result: urlResult } = renderHook(() =>
        useEnvValue("NEXT_PUBLIC_API_BASE_URL")
      );

      // Type should be narrowed to string (not string | undefined)
      expect(typeof urlResult.current).toBe("string");
      expect(urlResult.current).toBe("https://api.example.com");
    });

    it("should handle optional env vars with correct typing", () => {
      delete process.env.BASIC_AUTH_USERNAME;
      delete process.env.BASIC_AUTH_PASSWORD;

      const { result } = renderHook(() => useEnv());

      // Optional fields may be undefined
      expect(
        result.current.BASIC_AUTH_USERNAME === undefined ||
          typeof result.current.BASIC_AUTH_USERNAME === "string"
      ).toBe(true);
      expect(
        result.current.BASIC_AUTH_PASSWORD === undefined ||
          typeof result.current.BASIC_AUTH_PASSWORD === "string"
      ).toBe(true);
    });

    it("should return undefined for optional env vars when not set", () => {
      delete process.env.BASIC_AUTH_USERNAME;
      delete process.env.BASIC_AUTH_PASSWORD;

      const { result: usernameResult } = renderHook(() =>
        useEnvValue("BASIC_AUTH_USERNAME")
      );
      const { result: passwordResult } = renderHook(() =>
        useEnvValue("BASIC_AUTH_PASSWORD")
      );

      // Optional fields should be undefined (not empty string)
      expect(usernameResult.current).toBeUndefined();
      expect(passwordResult.current).toBeUndefined();
    });

    it("should return optional env var values when set", () => {
      process.env.BASIC_AUTH_USERNAME = "admin";
      process.env.BASIC_AUTH_PASSWORD = "secret";

      const { result: usernameResult } = renderHook(() =>
        useEnvValue("BASIC_AUTH_USERNAME")
      );
      const { result: passwordResult } = renderHook(() =>
        useEnvValue("BASIC_AUTH_PASSWORD")
      );

      // Optional fields should return actual values when set
      expect(usernameResult.current).toBe("admin");
      expect(passwordResult.current).toBe("secret");
    });

    it("should clearly distinguish between required and optional fields", () => {
      // Required field must be provided
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8002";
      delete process.env.BASIC_AUTH_USERNAME;

      const { result } = renderHook(() => useEnv());

      // Required field always has a value
      expect(result.current.NEXT_PUBLIC_API_BASE_URL).toBe(
        "http://localhost:8002"
      );

      // Optional field is undefined (not a default value)
      expect(result.current.BASIC_AUTH_USERNAME).toBeUndefined();
    });

    it("should throw error when required env var is missing", () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;

      expect(() => {
        renderHook(() => useEnv());
      }).toThrow("Missing required environment variable");
    });
  });
});
