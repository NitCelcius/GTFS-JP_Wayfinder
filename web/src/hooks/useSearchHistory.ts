// React hooks for search history management
import { useCallback, useEffect, useState } from "react";

import { RecentBusStopSearch, RecentRouteSearch } from "@/domains/recent";
import { searchHistoryService } from "@/lib/searchHistory";

export function useSearchHistory() {
  const [busStopSearches, setBusStopSearches] = useState<RecentBusStopSearch[]>(
    []
  );
  const [routeSearches, setRouteSearches] = useState<RecentRouteSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load search history on component mount
  const loadSearchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [busStops, routes] = await Promise.all([
        searchHistoryService.getBusStopSearches(10),
        searchHistoryService.getRouteSearches(10),
      ]);

      setBusStopSearches(busStops);
      setRouteSearches(routes);
    } catch (err) {
      console.error("Failed to load search history:", err);
      setError("検索履歴の読み込みに失敗しました");

      // Fallback to empty arrays on error
      setBusStopSearches([]);
      setRouteSearches([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add bus stop search to history
  const addBusStopSearch = useCallback(
    async (stopId: string, name: string, distance: string = "") => {
      try {
        await searchHistoryService.addBusStopSearch(stopId, name, distance);
        // Refresh the search history after adding
        await loadSearchHistory();
      } catch (err) {
        console.error("Failed to add bus stop search:", err);
        setError("検索履歴の保存に失敗しました");
      }
    },
    [loadSearchHistory]
  );

  // Add route search to history
  const addRouteSearch = useCallback(
    async (fromStation: string, toStation: string) => {
      try {
        await searchHistoryService.addRouteSearch(fromStation, toStation);
        // Refresh the search history after adding
        await loadSearchHistory();
      } catch (err) {
        console.error("Failed to add route search:", err);
        setError("検索履歴の保存に失敗しました");
      }
    },
    [loadSearchHistory]
  );

  // Clear all search history
  const clearAllHistory = useCallback(async () => {
    try {
      await searchHistoryService.clearAllHistory();
      setBusStopSearches([]);
      setRouteSearches([]);
    } catch (err) {
      console.error("Failed to clear search history:", err);
      setError("検索履歴の削除に失敗しました");
    }
  }, []);

  // Load history on mount
  useEffect(() => {
    loadSearchHistory();
  }, [loadSearchHistory]);

  return {
    busStopSearches,
    routeSearches,
    isLoading,
    error,
    addBusStopSearch,
    addRouteSearch,
    clearAllHistory,
    refreshHistory: loadSearchHistory,
  };
}
