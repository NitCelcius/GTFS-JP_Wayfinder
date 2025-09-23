import type { Meta, StoryObj } from '@storybook/react';
import { RouteOverview } from './RouteOverview';

const meta: Meta<typeof RouteOverview> = {
  title: 'Internal/Route Search/RouteOverview',
  component: RouteOverview,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    fromStation: { control: 'text' },
    toStation: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    fromStation: '東駅',
    toStation: '市役所前',
  },
};

export const LongStationNames: Story = {
  args: {
    fromStation: 'あきた芸術劇場ミルハス・にぎわい交流館 AU 前',
    toStation: '大学病院',
  },
};

export const ShortStationNames: Story = {
  args: {
    fromStation: '西口',
    toStation: '南町',
  },
};