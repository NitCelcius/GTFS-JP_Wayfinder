import type { Meta, StoryObj } from '@storybook/react';
import { BusStopItem } from './BusStopItem';
import { BusStop } from './BusStopList';

const meta: Meta<typeof BusStopItem> = {
  title: 'Internal/Bus Stop Search/BusStopItem',
  component: BusStopItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSelect: { action: 'busStopSelected' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleBusStop: BusStop = {
  id: '1',
  name: '中央公園',
  distance: '120m',
  selectUrl: '/bus-stop/1',
};

export const Default: Story = {
  args: {
    busStop: sampleBusStop,
    onSelect: (busStopId: string) => console.log('Selected:', busStopId),
  },
};

export const LongName: Story = {
  args: {
    busStop: {
      id: '2',
      name: 'あきた芸術劇場ミルハス・にぎわい交流館 AU 前',
      distance: '500m',
      selectUrl: '/bus-stop/2',
    },
    onSelect: (busStopId: string) => console.log('Selected:', busStopId),
  },
};

export const FarDistance: Story = {
  args: {
    busStop: {
      id: '3',
      name: '東駅',
      distance: '1.2km',
      selectUrl: '/bus-stop/3',
    },
    onSelect: (busStopId: string) => console.log('Selected:', busStopId),
  },
};

export const NoSelection: Story = {
  args: {
    busStop: sampleBusStop,
    // No onSelect handler
  },
};