import type { Meta, StoryObj } from "@storybook/react";

import { WalkTransferIndicator } from "./WalkTransferIndicator";

const meta = {
  title: "Domains/RouteSearch/Internal/WalkTransferIndicator",
  component: WalkTransferIndicator,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "バス乗り換え区間に表示される徒歩乗り換えインジケーター。同じ駅の異なるのりば間の乗り換えを示します。",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof WalkTransferIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本的な乗り換え表示（のりば指定あり）
 */
export const Default: Story = {
  args: {
    transferStationName: "秋田駅東口",
    platformCode: "2",
  },
};

/**
 * のりば指定なしの乗り換え表示
 */
export const WithoutPlatform: Story = {
  args: {
    transferStationName: "秋田駅西口",
  },
};

/**
 * 長い駅名での表示
 */
export const LongStationName: Story = {
  args: {
    transferStationName: "あきた芸術劇場ミルハス・にぎわい交流館 AU 前",
    platformCode: "1",
  },
};

/**
 * 日本語表記ののりば
 */
export const JapanesePlatform: Story = {
  args: {
    transferStationName: "中央公園",
    platformCode: "北",
  },
};

/**
 * 複数のインジケーターを縦に並べた例
 */
export const MultipleTransfers: Story = {
  args: {
    transferStationName: "東駅",
    platformCode: "1",
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <WalkTransferIndicator transferStationName="東駅" platformCode="1" />
      <WalkTransferIndicator transferStationName="中央公園" platformCode="3" />
      <WalkTransferIndicator transferStationName="市役所前" />
    </div>
  ),
};

/**
 * モバイル幅での表示
 */
export const MobileWidth: Story = {
  args: {
    transferStationName: "秋田駅東口",
    platformCode: "2",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "320px" }}>
        <Story />
      </div>
    ),
  ],
};
