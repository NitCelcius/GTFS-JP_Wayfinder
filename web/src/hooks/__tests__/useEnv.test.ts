import { renderHook } from "@testing-library/react";

import { useEnv, useEnvValue } from "../useEnv";

describe("useEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    // Clean up any injected window.__ENV__
    if (typeof window !== "undefined") {
      delete (window as any).__ENV__;
    }
  });

  afterEach(() => {
    process.env = originalEnv;
    // Clean up any injected window.__ENV__
    if (typeof window !== "undefined") {
      delete (window as any).__ENV__;
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
      (window as any).__ENV__ = {
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

      const { result } = renderHook(() =>
        useEnvValue("NEXT_PUBLIC_API_BASE_URL")
      );

      expect(result.current).toBe("http://localhost:8002");
    });

    it("should use window.__ENV__ value when available", () => {
      // Mock window.__ENV__
      (window as any).__ENV__ = {
        NEXT_PUBLIC_BASE_URL: "https://custom.example.com",
      };

      const { result } = renderHook(() =>
        useEnvValue("NEXT_PUBLIC_BASE_URL")
      );

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
      (window as any).__ENV__ = {
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

      (window as any).__ENV__ = {
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
});
