import { useEffect, useRef, useState } from "react";

import type { StopIdAndName } from "@/api/types.gen";
import { apiClient } from "@/lib/api";
import type { BusStopSearchResult } from "@/types";

import { BusStopSearchModal } from "./BusStopSearchModal";

interface BusStopSearchModalContainerProps {
  isOpen: boolean;
  onCanceled: () => void;
  onSelected: (result: BusStopSearchResult) => void;
  title?: string;
  placeholder?: string;
}

/**
 * Container component that manages API requests and state for the BusStopSearchModal.
 * This component handles debounced search, loading states, and error handling.
 */
export function BusStopSearchModalContainer({
  isOpen,
  onCanceled,
  onSelected,
  title = "バス停を検索",
  placeholder = "バス停名を入力してください",
}: BusStopSearchModalContainerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StopIdAndName[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.searchBusStops(
          searchQuery.trim(),
          false
        );

        if (response.data) {
          setSearchResults(response.data.stop_ids);
        }
      } catch (err) {
        console.error("Failed to search bus stops:", err);
        setError("バス停の検索に失敗しました。もう一度お試しください。");
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <BusStopSearchModal
      isOpen={isOpen}
      onCanceled={onCanceled}
      onSelected={onSelected}
      title={title}
      placeholder={placeholder}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      searchResults={searchResults}
      isLoading={isLoading}
      error={error}
    />
  );
}
