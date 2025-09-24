// React hooks for search history management
import { useCallback, useEffect, useState } from "react";

import { RecentBusStopSearch, RecentRouteSearch } from "@/domains/recent";
import { searchHistoryService } from "@/lib/searchHistory";

export function useBusStopSearchHistory() {
  const [busStopSearches, setBusStopSearches] = useState<RecentBusStopSearch[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bus stop search history on component mount
  const loadBusStopSearchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const busStops = await searchHistoryService.getBusStopSearches(10);
      setBusStopSearches(busStops);
    } catch (err) {
      console.error("Failed to load bus stop search history:", err);
      setError("検索履歴の読み込みに失敗しました");

      // Fallback to empty array on error
      setBusStopSearches([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add bus stop search to history
  const addBusStopSearch = useCallback(
    async (stopId: string, name: string) => {
      try {
        await searchHistoryService.addBusStopSearch(stopId, name);
        // Refresh the search history after adding
        await loadBusStopSearchHistory();
      } catch (err) {
        console.error("Failed to add bus stop search:", err);
        setError("検索履歴の保存に失敗しました");
      }
    },
    [loadBusStopSearchHistory]
  );

  // Clear bus stop search history
  const clearBusStopSearchHistory = useCallback(async () => {
    try {
      await searchHistoryService.clearBusStopSearchHistory();
      setBusStopSearches([]);
    } catch (err) {
      console.error("Failed to clear bus stop search history:", err);
      setError("検索履歴の削除に失敗しました");
    }
  }, []);

  // Load history on mount
  useEffect(() => {
    loadBusStopSearchHistory();
  }, [loadBusStopSearchHistory]);

  return {
    busStopSearches,
    isLoading,
    error,
    addBusStopSearch,
    clearBusStopSearchHistory,
    refreshHistory: loadBusStopSearchHistory,
  };
}

export function useRouteSearchHistory() {
  const [routeSearches, setRouteSearches] = useState<RecentRouteSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load route search history on component mount
  const loadRouteSearchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const routes = await searchHistoryService.getRouteSearches(10);
      setRouteSearches(routes);
    } catch (err) {
      console.error("Failed to load route search history:", err);
      setError("検索履歴の読み込みに失敗しました");

      // Fallback to empty array on error
      setRouteSearches([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add route search to history
  const addRouteSearch = useCallback(
    async (fromStation: string, toStation: string) => {
      try {
        await searchHistoryService.addRouteSearch(fromStation, toStation);
        // Refresh the search history after adding
        await loadRouteSearchHistory();
      } catch (err) {
        console.error("Failed to add route search:", err);
        setError("検索履歴の保存に失敗しました");
      }
    },
    [loadRouteSearchHistory]
  );

  // Clear route search history
  const clearRouteSearchHistory = useCallback(async () => {
    try {
      await searchHistoryService.clearRouteSearchHistory();
      setRouteSearches([]);
    } catch (err) {
      console.error("Failed to clear route search history:", err);
      setError("検索履歴の削除に失敗しました");
    }
  }, []);

  // Load history on mount
  useEffect(() => {
    loadRouteSearchHistory();
  }, [loadRouteSearchHistory]);

  return {
    routeSearches,
    isLoading,
    error,
    addRouteSearch,
    clearRouteSearchHistory,
    refreshHistory: loadRouteSearchHistory,
  };
}

// Combined hook for components that need both
export function useSearchHistory() {
  const busStopHistory = useBusStopSearchHistory();
  const routeHistory = useRouteSearchHistory();

  // Clear all search history
  const clearAllHistory = useCallback(async () => {
    try {
      await searchHistoryService.clearAllHistory();
      busStopHistory.refreshHistory();
      routeHistory.refreshHistory();
    } catch (err) {
      console.error("Failed to clear all search history:", err);
    }
  }, [busStopHistory, routeHistory]);

  return {
    busStopSearches: busStopHistory.busStopSearches,
    routeSearches: routeHistory.routeSearches,
    isLoading: busStopHistory.isLoading || routeHistory.isLoading,
    error: busStopHistory.error || routeHistory.error,
    addBusStopSearch: busStopHistory.addBusStopSearch,
    addRouteSearch: routeHistory.addRouteSearch,
    clearAllHistory,
    clearBusStopSearchHistory: busStopHistory.clearBusStopSearchHistory,
    clearRouteSearchHistory: routeHistory.clearRouteSearchHistory,
    refreshHistory: async () => {
      await Promise.all([
        busStopHistory.refreshHistory(),
        routeHistory.refreshHistory(),
      ]);
    },
  };
}
