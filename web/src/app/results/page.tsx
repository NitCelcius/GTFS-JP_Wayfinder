"use client";

import { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { SearchResultPage } from "@/domains/route-search";
import type { TripDetails } from "@/domains/route-search/SearchResultPage/types";
import { apiClient } from "@/lib/api";
import type { RouteSearchResult } from "@/types";
import { convertRouteSearchToTripDetails } from "@/types";

// Disable static generation for this dynamic page
export const dynamic = "force-dynamic";

// No empty placeholder: if data can't be fetched we treat it as an error

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const getCurrentTimeString = (): string => {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:00`;
      };

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
          }

          const result: RouteSearchResult = {
            travels: response.data.travels,
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
        const performSearch = searchParams.get("search") === "true";
        const fromStop = searchParams.get("from");
        const toStop = searchParams.get("to");
        const beginTime = searchParams.get("time");

        if ((forceReal || performSearch) && fromStop && toStop) {
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
            setTripDetails(convertedTripDetails);
          } else {
            throw new Error("API呼び出しから結果が得られませんでした");
          }
        } else {
          const storedResult = localStorage.getItem("routeSearchResult");

          if (storedResult) {
            const searchResult: RouteSearchResult = JSON.parse(storedResult);
            const convertedTripDetails =
              convertRouteSearchToTripDetails(searchResult);
            setTripDetails(convertedTripDetails);
            localStorage.removeItem("routeSearchResult");
          } else {
            setError("検索結果が見つかりません。検索を実行してください。");
          }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg font-medium mb-2">
            🚌 経路を検索しています...
          </div>
          <div className="text-sm text-gray-600">
            リアルタイムバス情報を取得中
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">エラー: {error}</div>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            検索に戻る
          </button>
        </div>
      </div>
    );
  }

  if (!tripDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4">検索結果がありません</div>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            検索に戻る
          </button>
        </div>
      </div>
    );
  }

  const hasRoutes = tripDetails.routes && tripDetails.routes.length > 0;
  const isQuerySearch =
    searchParams.get("real") === "true" ||
    searchParams.get("search") === "true";
  const isResultLike = tripDetails !== null;

  return (
    <div>
      {(isQuerySearch || isResultLike) && !hasRoutes && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700 mb-4">
          <p className="font-semibold mb-2">❌ 経路が見つかりません</p>
          <p>
            選択したバス停間で指定時間に運行する経路が見つかりませんでした。
          </p>
          <p className="mt-2">以下の原因が考えられます：</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>バス停IDがGTFSデータに存在しない</li>
            <li>これらのバス停間に運行経路がない</li>
            <li>指定時間に運行サービスがない</li>
          </ul>
        </div>
      )}

      {hasRoutes ? (
        <SearchResultPage
          tripDetails={tripDetails}
          onRouteSelect={handleRouteSelect}
          onBack={() => router.push("/")}
          onNavigateToBusStop={() => router.push("/bus-stop")}
          onNavigateToRecent={() => router.push("/recent")}
          isLoading={false}
        />
      ) : (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold mb-2">検索準備完了</h2>
            <p className="text-gray-600 mb-4">
              経路検索を実行してリアルタイムのバス経路を確認しましょう
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              🚌 経路検索を開始
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
