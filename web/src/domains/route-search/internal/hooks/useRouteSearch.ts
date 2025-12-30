import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import type { TripDetails } from "@/domains/route-search/SearchResultPage/types";
import { apiClient } from "@/lib/api";
import { getCurrentTimeString, sortTravelsByArrivalTime } from "@/lib/utils";
import type { RouteSearchResult } from "@/types";

import { getCachedRouteSearchResult } from "../../utils";
import { convertRouteSearchToTripDetails } from "../utils";

export interface UseRouteSearchResult {
  tripDetails: TripDetails | null;
  isLoading: boolean;
  error: string | null;
  handleRouteSelect: (routeId: string) => void;
}

/**
 * Custom hook for handling route search logic including API calls,
 * localStorage handling, and data transformation
 */
export function useRouteSearch(): UseRouteSearchResult {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const makeRealApiCall = async (
        fromStop: string,
        toStop: string,
        beginTime?: string
      ): Promise<RouteSearchResult | null> => {
        try {
          const time = beginTime || getCurrentTimeString();

          const response = await apiClient.searchTimedRoutes(
            fromStop,
            toStop,
            time
          );

          if (response.error) {
            throw new Error(`API エラー: ${JSON.stringify(response.error)}`);
          }

          let originStopName = `バス停 ${fromStop}`;
          let destinationStopName = `バス停 ${toStop}`;

          try {
            const [originResponse, destResponse] = await Promise.all([
              apiClient.getStopNames(fromStop),
              apiClient.getStopNames(toStop),
            ]);

            if (
              originResponse.data?.stop_names &&
              originResponse.data.stop_names.length > 0
            ) {
              originStopName = originResponse.data.stop_names[0];
            }
            if (
              destResponse.data?.stop_names &&
              destResponse.data.stop_names.length > 0
            ) {
              destinationStopName = destResponse.data.stop_names[0];
            }
          } catch (error) {
            console.warn("バス停名の取得に失敗しました:", error);
            setError("バス停名の取得に失敗したため、IDで表示しています。");
          }

          // Sort travels by arrival time (earliest first)
          const sortedTravels = sortTravelsByArrivalTime(response.data.travels);

          const result: RouteSearchResult = {
            travels: sortedTravels,
            originStopName,
            destinationStopName,
            searchTime: time,
          };

          return result;
        } catch (error) {
          console.error("API呼び出しが失敗しました:", error);
          throw error;
        }
      };

      try {
        const forceReal = searchParams.get("real") === "true";
        const fromStop = searchParams.get("from");
        const toStop = searchParams.get("to");
        const beginTime = searchParams.get("time");
        const selectedTrip = searchParams.get("selectedTrip");

        // Check sessionStorage first with validation to avoid duplicate API calls
        let cachedResult: RouteSearchResult | null = null;
        if (fromStop && toStop && !forceReal) {
          cachedResult = getCachedRouteSearchResult(fromStop, toStop);
        }

        let useCache = false;

        if (cachedResult) {
          useCache = true;
          const fromName =
            searchParams.get("fromName") || cachedResult.originStopName;
          const toName =
            searchParams.get("toName") || cachedResult.destinationStopName;

          const resultWithNames = {
            ...cachedResult,
            originStopName: fromName,
            destinationStopName: toName,
          };

          const convertedTripDetails =
            convertRouteSearchToTripDetails(resultWithNames);

          // If a specific trip was selected from route overview, pre-select it
          if (selectedTrip) {
            const routeIndex = resultWithNames.travels.findIndex(
              (travel) => travel.trip_id === selectedTrip
            );
            if (routeIndex >= 0) {
              convertedTripDetails.selectedRouteId = `route-${routeIndex + 1}`;
            }
          }

          setTripDetails(convertedTripDetails);

          // Note: Cache is not cleared here to allow back button navigation
          // Cache will expire naturally after 5 minutes or be overwritten by new searches
        }

        // Fall back to API call if cache miss or direct navigation
        if (!useCache && fromStop && toStop) {
          setIsLoading(true);

          const fromName = searchParams.get("fromName") || `バス停 ${fromStop}`;
          const toName = searchParams.get("toName") || `バス停 ${toStop}`;

          const realResult = await makeRealApiCall(
            fromStop,
            toStop,
            beginTime || undefined
          );
          if (realResult) {
            const resultWithNames = {
              ...realResult,
              originStopName: fromName,
              destinationStopName: toName,
            };

            const convertedTripDetails =
              convertRouteSearchToTripDetails(resultWithNames);

            // If a specific trip was selected from route overview, pre-select it
            if (selectedTrip) {
              const routeIndex = resultWithNames.travels.findIndex(
                (travel) => travel.trip_id === selectedTrip
              );
              if (routeIndex >= 0) {
                convertedTripDetails.selectedRouteId = `route-${routeIndex + 1}`;
              }
            }

            setTripDetails(convertedTripDetails);
          } else {
            throw new Error("API呼び出しから結果が得られませんでした");
          }
        } else if (!useCache) {
          setError("検索結果が見つかりません。検索を実行してください。");
        }
      } catch (error) {
        console.error("検索結果の読み込みでエラーが発生:", error);
        setError(
          error instanceof Error
            ? error.message
            : "検索結果の読み込みに失敗しました"
        );
        // leave tripDetails as null so the error UI is shown
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  const handleRouteSelect = (routeId: string) => {
    setTripDetails((prev) =>
      prev ? { ...prev, selectedRouteId: routeId } : null
    );
  };

  return {
    tripDetails,
    isLoading,
    error,
    handleRouteSelect,
  };
}
