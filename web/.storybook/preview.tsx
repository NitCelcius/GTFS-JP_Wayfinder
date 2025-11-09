// Storybook preview needs to directly set window.__ENV__ for environment initialization
import type { Decorator, Preview } from "@storybook/react";

import React from "react";

import "@/app/globals.css";

import {
  type EnvConfig,
  type EnvOverrides,
  EnvProvider,
  buildEnv,
} from "../src/hooks/useEnv";

type WindowWithEnv = Window & { __ENV__?: EnvConfig };

const getWindowWithEnv = (): WindowWithEnv | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window as WindowWithEnv;
};

const BASE_ENV = buildEnv();

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
