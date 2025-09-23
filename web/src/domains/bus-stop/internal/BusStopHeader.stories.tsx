import type { Meta, StoryObj } from '@storybook/react';
import { BusStopHeader } from './BusStopHeader';

const meta: Meta<typeof BusStopHeader> = {
  title: 'Internal/Bus Stop/BusStopHeader',
  component: BusStopHeader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    distance: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: '中央公園',
    distance: '120m',
  },
};

export const LongName: Story = {
  args: {
    name: 'あきた芸術劇場ミルハス・にぎわい交流館 AU 前',
    distance: '300m',
  },
};

export const FarDistance: Story = {
  args: {
    name: '東駅',
    distance: '1.2km',
  },
};

export const CloseDistance: Story = {
  args: {
    name: '市役所前',
    distance: '50m',
  },
};