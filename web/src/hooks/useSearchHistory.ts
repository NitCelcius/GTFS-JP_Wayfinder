import { useCallback, useEffect, useState } from "react";

import { RecentBusStopSearch, RecentRouteSearch } from "@/domains/recent/types";
import {
  BusStopSearchRecord,
  RouteSearchRecord,
  addBusStopSearch,
  addRouteSearch,
  getBusStopSearches,
  getRouteSearches,
} from "@/lib/indexedDB";
import { formatRelativeDate } from "@/lib/utils";

/**
 * Hook for managing bus stop search history
 */
export function useBusStopSearchHistory() {
  const [searches, setSearches] = useState<RecentBusStopSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSearches = useCallback(async () => {
    try {
      setIsLoading(true);
      const records = await getBusStopSearches(10);
      const formatted = records.map((record) =>
        convertBusStopRecordToRecent(record)
      );
      setSearches(formatted);
    } catch (error) {
      console.error("Failed to load bus stop search history:", error);
      setSearches([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addSearch = useCallback(
    async (stopId: string, name: string, distance: string) => {
      try {
        await addBusStopSearch(stopId, name, distance);
        await loadSearches();
      } catch (error) {
        console.error("Failed to add bus stop search:", error);
      }
    },
    [loadSearches]
  );

  useEffect(() => {
    loadSearches();
  }, [loadSearches]);

  return { searches, isLoading, addSearch, refresh: loadSearches };
}

/**
 * Hook for managing route search history
 */
export function useRouteSearchHistory() {
  const [searches, setSearches] = useState<RecentRouteSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSearches = useCallback(async () => {
    try {
      setIsLoading(true);
      const records = await getRouteSearches(10);
      const formatted = records.map((record) =>
        convertRouteRecordToRecent(record)
      );
      setSearches(formatted);
    } catch (error) {
      console.error("Failed to load route search history:", error);
      setSearches([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addSearch = useCallback(
    async (
      fromStopId: string,
      toStopId: string,
      fromStation: string,
      toStation: string
    ) => {
      try {
        await addRouteSearch(fromStopId, toStopId, fromStation, toStation);
        await loadSearches();
      } catch (error) {
        console.error("Failed to add route search:", error);
      }
    },
    [loadSearches]
  );

  useEffect(() => {
    loadSearches();
  }, [loadSearches]);

  return { searches, isLoading, addSearch, refresh: loadSearches };
}

/**
 * Convert IndexedDB record to RecentBusStopSearch
 */
function convertBusStopRecordToRecent(
  record: BusStopSearchRecord
): RecentBusStopSearch {
  return {
    id: record.stopId, // Use stopId as the display ID for navigation
    name: record.name,
    distance: record.distance,
    searchedAt: formatRelativeDate(record.searchedAt),
  };
}

/**
 * Convert IndexedDB record to RecentRouteSearch
 */
function convertRouteRecordToRecent(
  record: RouteSearchRecord
): RecentRouteSearch {
  return {
    id: record.id,
    fromStopId: record.fromStopId,
    toStopId: record.toStopId,
    fromStopName: record.fromStopName,
    toStopName: record.toStopName,
    searchedAt: formatRelativeDate(record.searchedAt),
  };
}
