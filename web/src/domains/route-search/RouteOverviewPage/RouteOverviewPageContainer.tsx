"use client";

import { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { ErrorFullScreen } from "@/components/common";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { cacheRouteSearchResult } from "@/domains/route-search/utils";
import { apiClient } from "@/lib/api";
import { getCurrentTimeString, sortTravelsByArrivalTime } from "@/lib/utils";
import type { RouteSearchResult } from "@/types";

import { RouteOverviewPage } from "./RouteOverviewPage";
import type { RouteOverviewData } from "./types";
import { convertToRouteOverviewData } from "./utils";

/**
 * Props for the RouteOverviewPageContainer
 */
interface RouteOverviewPageContainerProps {
  /** Callback when user navigates back */
  onBack: () => void;
  /** Callback to navigate to bus stop search page */
  onNavigateToBusStop: () => void;
  /** Callback to navigate to recent searches page */
  onNavigateToRecent: () => void;
}

/**
 * Container component that handles data fetching and state management for the RouteOverviewPage.
 * Fetches route options from the API based on URL search parameters and converts
 * the API response to UI-friendly format.
 */
export function RouteOverviewPageContainer({
  onBack,
  onNavigateToBusStop,
  onNavigateToRecent,
}: RouteOverviewPageContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [routeData, setRouteData] = useState<RouteOverviewData | null>(null);
  const [searchResult, setSearchResult] = useState<RouteSearchResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const fromStop = searchParams.get("from");
        const toStop = searchParams.get("to");
        const beginTime = searchParams.get("time");
        const fromName = searchParams.get("fromName");
        const toName = searchParams.get("toName");

        if (!fromStop || !toStop) {
          setError("出発地と目的地を指定してください。");
          setIsLoading(false);
          return;
        }

        setIsLoading(true);

        const time = beginTime || getCurrentTimeString();
        const response = await apiClient.searchTimedRoutes(
          fromStop,
          toStop,
          time
        );

        if (response.error) {
          throw new Error(`API エラー: ${JSON.stringify(response.error)}`);
        }

        if (!response.data?.travels || response.data.travels.length === 0) {
          setError("経路が見つかりませんでした。");
          setIsLoading(false);
          return;
        }

        // Sort travels by arrival time (earliest first)
        const sortedTravels = sortTravelsByArrivalTime(response.data.travels);

        const result: RouteSearchResult = {
          travels: sortedTravels,
          originStopName: fromName || `バス停 ${fromStop}`,
          destinationStopName: toName || `バス停 ${toStop}`,
          searchTime: time,
        };

        // Store the result for later use to avoid duplicate API calls
        setSearchResult(result);

        const overviewData = convertToRouteOverviewData(result);
        setRouteData(overviewData);
      } catch (error) {
        console.error("経路検索エラー:", error);
        setError(
          error instanceof Error ? error.message : "経路の検索に失敗しました。"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutes();
  }, [searchParams]);

  const handleRouteSelect = (tripId: string) => {
    const fromStop = searchParams.get("from");
    const toStop = searchParams.get("to");

    // Store the complete search result in sessionStorage with validation
    // to avoid duplicate API calls while maintaining security
    if (searchResult && fromStop && toStop) {
      cacheRouteSearchResult(searchResult, fromStop, toStop);
    }

    // Navigate to the detailed results page with the selected trip
    const params = new URLSearchParams({
      from: fromStop || "",
      to: toStop || "",
      fromName: searchParams.get("fromName") || "",
      toName: searchParams.get("toName") || "",
      time: searchParams.get("time") || getCurrentTimeString(),
      selectedTrip: tripId,
    });

    router.push(`/results?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-[var(--spacing-lg)]">
        <LoadingSpinner size="lg" />
        <p className="text-[var(--gray-600)]">経路を検索中...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorFullScreen message={error} />;
  }

  if (!routeData) {
    return <ErrorFullScreen message="経路データを読み込めませんでした。" />;
  }

  return (
    <RouteOverviewPage
      routeData={routeData}
      onRouteSelect={handleRouteSelect}
      onBack={onBack}
      onNavigateToBusStop={onNavigateToBusStop}
      onNavigateToRecent={onNavigateToRecent}
    />
  );
}
