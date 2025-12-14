// Storybook preview needs to directly set window.__ENV__ for environment initialization
import type { Decorator, Preview } from "@storybook/react";

import React from "react";

import "@/app/globals.css";

import {
  type EnvConfig,
  type EnvOverrides,
  EnvProvider,
} from "../src/hooks/useEnv";

type WindowWithEnv = Window & { __ENV__?: EnvConfig };

const getWindowWithEnv = (): WindowWithEnv | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window as WindowWithEnv;
};

// Base environment for Storybook - define defaults here
const BASE_ENV: EnvConfig = {
  NEXT_PUBLIC_API_BASE_URL: "http://localhost:8002",
  NEXT_PUBLIC_BASE_URL: "http://localhost:6006", // Storybook default port
  NEXT_PUBLIC_USE_RELATIVE_TIME: "false",
  NODE_ENV: "development",
  ENABLE_BASIC_AUTH: "false",
  BASIC_AUTH_USERNAME: undefined,
  BASIC_AUTH_PASSWORD: undefined,
};

const envWindow = getWindowWithEnv();

if (envWindow) {
  envWindow.__ENV__ = { ...BASE_ENV };
}

const withEnv: Decorator = (Story, context) => {
  const overrides = (context.parameters?.env ?? {}) as EnvOverrides;
  const envForStory: EnvConfig = { ...BASE_ENV, ...overrides };

  const storyWindow = getWindowWithEnv();
  if (storyWindow) {
    storyWindow.__ENV__ = { ...envForStory };
  }

  return (
    <EnvProvider value={envForStory}>
      <Story />
    </EnvProvider>
  );
};

const preview: Preview = {
  decorators: [withEnv],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
