import type { Meta, StoryObj } from '@storybook/react';
import { RecentBusStopSearches } from './RecentBusStopSearches';
import { RecentBusStopSearch } from '../types';

const meta: Meta<typeof RecentBusStopSearches> = {
  title: 'Recent/Internal/RecentBusStopSearches',
  component: RecentBusStopSearches,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onBusStopSelect: { action: 'busStopSelected' },
    onViewMore: { action: 'viewMoreClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleBusStops: RecentBusStopSearch[] = [
  {
    id: '1',
    name: '中央公園',
    distance: '120m',
    searchedAt: '2時間前',
  },
  {
    id: '2',
    name: '東駅',
    distance: '300m',
    searchedAt: '昨日',
  },
  {
    id: '3',
    name: 'あきた芸術劇場ミルハス・にぎわい交流館 AU 前',
    distance: '500m',
    searchedAt: '3日前',
  },
];

export const WithRecentSearches: Story = {
  args: {
    recentBusStops: sampleBusStops,
    onBusStopSelect: (busStopId: string) => console.log('Selected:', busStopId),
    onViewMore: () => console.log('View more clicked'),
  },
};

export const Empty: Story = {
  args: {
    recentBusStops: [],
    onBusStopSelect: (busStopId: string) => console.log('Selected:', busStopId),
    onViewMore: () => console.log('View more clicked'),
  },
};

export const SingleItem: Story = {
  args: {
    recentBusStops: [sampleBusStops[0]],
    onBusStopSelect: (busStopId: string) => console.log('Selected:', busStopId),
    onViewMore: () => console.log('View more clicked'),
  },
};