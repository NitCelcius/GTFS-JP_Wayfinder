"use client";

import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import { ErrorFullScreen } from "@/components/common";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { apiClient } from "@/lib/api";
import { getCurrentTimeString, sortTravelsByArrivalTime } from "@/lib/utils";

import { convertRouteSearchToRouteDetail } from "../internal/utils";
import { clearRouteCacheResult, getCachedRouteSearchResult } from "../utils";
import { RouteDetailPage } from "./RouteDetailPage";
import type { Route } from "./types";

/**
 * Props for the RouteDetailPageContainer
 */
interface RouteDetailPageContainerProps {
  /** Callback when user navigates back */
  onBack: () => void;
  /** Callback to navigate to bus stop search page */
  onNavigateToBusStop: () => void;
  /** Callback to navigate to recent searches page */
  onNavigateToRecent: () => void;
}

/**
 * Container component that handles data fetching and state management for RouteDetailPage.
 * Fetches a single route's detailed information based on URL parameters.
 * Uses localStorage cache from RouteOverviewPage when available.
 */
export function RouteDetailPageContainer({
  onBack,
  onNavigateToBusStop,
  onNavigateToRecent,
}: RouteDetailPageContainerProps) {
  const searchParams = useSearchParams();
  const [route, setRoute] = useState<Route | null>(null);
  const [fromStation, setFromStation] = useState<string>("");
  const [toStation, setToStation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRouteDetail = async () => {
      try {
        const fromStop = searchParams.get("from");
        const toStop = searchParams.get("to");
        const beginTime = searchParams.get("time");
        const selectedTrip = searchParams.get("selectedTrip");
        const fromName = searchParams.get("fromName");
        const toName = searchParams.get("toName");

        if (!fromStop || !toStop || !selectedTrip) {
          setError("必要なパラメータが不足しています。");
          setIsLoading(false);
          return;
        }

        setIsLoading(true);

        // Check sessionStorage first with validation (set by RouteOverviewPage)
        let searchResult = getCachedRouteSearchResult(fromStop, toStop);

        // Fall back to API call if no cache
        if (!searchResult) {
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

          // Sort travels by arrival time
          const sortedTravels = sortTravelsByArrivalTime(response.data.travels);

          searchResult = {
            travels: sortedTravels,
            originStopName: fromName || `バス停 ${fromStop}`,
            destinationStopName: toName || `バス停 ${toStop}`,
            searchTime: time,
          };
        }

        // Find the selected trip
        const selectedTravel = searchResult.travels.find(
          (travel) => travel.trip_id === selectedTrip
        );

        if (!selectedTravel) {
          setError("選択された経路が見つかりませんでした。");
          setIsLoading(false);
          return;
        }

        // Convert to Route format
        const routeDetail = convertRouteSearchToRouteDetail(
          selectedTravel,
          searchResult.originStopName,
          searchResult.destinationStopName
        );

        setRoute(routeDetail);
        setFromStation(searchResult.originStopName);
        setToStation(searchResult.destinationStopName);

        // Clear the cache after successful use
        clearRouteCacheResult(fromStop, toStop);
      } catch (error) {
        console.error("経路詳細の読み込みエラー:", error);
        setError(
          error instanceof Error
            ? error.message
            : "経路詳細の読み込みに失敗しました。"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadRouteDetail();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-[var(--spacing-lg)]">
        <LoadingSpinner size="lg" />
        <p className="text-[var(--gray-600)]">経路詳細を読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorFullScreen message={error} />;
  }

  if (!route) {
    return <ErrorFullScreen message="経路データを読み込めませんでした。" />;
  }

  return (
    <RouteDetailPage
      route={route}
      fromStation={fromStation}
      toStation={toStation}
      onBack={onBack}
      onNavigateToBusStop={onNavigateToBusStop}
      onNavigateToRecent={onNavigateToRecent}
    />
  );
}
