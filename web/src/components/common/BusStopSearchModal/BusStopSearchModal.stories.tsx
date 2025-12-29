import type { Meta, StoryObj } from "@storybook/react";

import type { StopIdAndName } from "@/api/types.gen";

import { BusStopSearchModal } from "./BusStopSearchModal";

const meta: Meta<typeof BusStopSearchModal> = {
  title: "Common/BusStopSearchModal",
  component: BusStopSearchModal,
  parameters: {
    layout: "fullscreen",
    chromatic: {
      pauseAnimationAtEnd: true,
    },
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: { control: "boolean" },
    onCanceled: { action: "canceled" },
    onSelected: { action: "selected" },
    title: { control: "text" },
    placeholder: { control: "text" },
    searchQuery: { control: "text" },
    onSearchQueryChange: { action: "searchQueryChanged" },
    isLoading: { control: "boolean" },
    error: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock search results based on the city mock data
const mockSearchResults: StopIdAndName[] = [
  { stop_id: "1021_01", stop_name: "秋田駅東口" },
  { stop_id: "shiyakusho-mae", stop_name: "市役所前" },
  { stop_id: "aobadai", stop_name: "青葉台" },
  { stop_id: "sakura-dori", stop_name: "さくら通り" },
  { stop_id: "midori-ga-oka", stop_name: "緑が丘" },
];

/**
 * Empty state - shown when no input has been entered yet
 */
export const Empty: Story = {
  args: {
    isOpen: true,
    title: "バス停を検索",
    placeholder: "バス停名を入力してください",
    searchQuery: "",
    searchResults: [],
    isLoading: false,
    error: null,
  },
};

/**
 * Loading state - shown while searching for bus stops
 */
export const Loading: Story = {
  args: {
    isOpen: true,
    title: "バス停を検索",
    placeholder: "バス停名を入力してください",
    searchQuery: "秋田",
    searchResults: [],
    isLoading: true,
    error: null,
  },
};

/**
 * Search results state - shown when search results are available
 */
export const WithResults: Story = {
  args: {
    isOpen: true,
    title: "バス停を検索",
    placeholder: "バス停名を入力してください",
    searchQuery: "秋田",
    searchResults: mockSearchResults,
    isLoading: false,
    error: null,
  },
};

/**
 * No results found - shown when search returns no results
 */
export const NoResults: Story = {
  args: {
    isOpen: true,
    title: "バス停を検索",
    placeholder: "バス停名を入力してください",
    searchQuery: "存在しないバス停",
    searchResults: [],
    isLoading: false,
    error: null,
  },
};

/**
 * Error state - shown when an error occurs during search
 */
export const Error: Story = {
  args: {
    isOpen: true,
    title: "バス停を検索",
    placeholder: "バス停名を入力してください",
    searchQuery: "秋田",
    searchResults: [],
    isLoading: false,
    error: "バス停の検索に失敗しました。もう一度お試しください。",
  },
};

/**
 * Closed state - modal is not visible
 */
export const Closed: Story = {
  args: {
    isOpen: false,
    title: "バス停を検索",
    placeholder: "バス停名を入力してください",
    searchQuery: "",
    searchResults: [],
    isLoading: false,
    error: null,
  },
};
