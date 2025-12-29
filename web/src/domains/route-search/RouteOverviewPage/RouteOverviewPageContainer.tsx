"use client";

import { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { ErrorFullScreen } from "@/components/common";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { apiClient } from "@/lib/api";
import { getCurrentTimeString } from "@/lib/utils";
import type { RouteSearchResult } from "@/types";

import { RouteOverviewPage } from "./RouteOverviewPage";
import type { RouteOverviewData } from "./types";
import { convertToRouteOverviewData } from "./utils";

interface RouteOverviewPageContainerProps {
  onBack: () => void;
  onNavigateToBusStop: () => void;
  onNavigateToRecent: () => void;
}

export function RouteOverviewPageContainer({
  onBack,
  onNavigateToBusStop,
  onNavigateToRecent,
}: RouteOverviewPageContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [routeData, setRouteData] = useState<RouteOverviewData | null>(null);
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

        const result: RouteSearchResult = {
          travels: response.data.travels,
          originStopName: fromName || `バス停 ${fromStop}`,
          destinationStopName: toName || `バス停 ${toStop}`,
          searchTime: time,
        };

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
    // Navigate to the detailed results page with the selected trip
    const params = new URLSearchParams({
      from: searchParams.get("from") || "",
      to: searchParams.get("to") || "",
      fromName: searchParams.get("fromName") || "",
      toName: searchParams.get("toName") || "",
      time: searchParams.get("time") || getCurrentTimeString(),
      selectedTrip: tripId,
      search: "true",
    });

    router.push(`/results?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          flexDirection: "column",
          gap: "var(--spacing-lg)",
        }}
      >
        <LoadingSpinner size="lg" />
        <p style={{ color: "var(--gray-600)" }}>経路を検索中...</p>
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
