"use client";

import { useRouter } from "next/navigation";

import { RecentPage } from "@/domains/recent";

export default function RecentSearchPage() {
  const router = useRouter();

  const gotoBusStopInfo = (id: string) => {
    router.push(`/bus-stop/${encodeURIComponent(id)}`);
  };

  return (
    <RecentPage
      onNavigateToRoute={() => router.push("/")}
      onNavigateToBusStop={() => router.push("/bus-stop")}
      onNavigateToBusStopInfo={gotoBusStopInfo}
      onNavigateToRouteSearch={(fromStopId, toStopId, fromStation, toStation) => {
        // Navigate to results page with search parameters
        const urlParams = new URLSearchParams({
          search: "true",
          from: fromStopId,
          to: toStopId,
          fromName: fromStation,
          toName: toStation,
          time: new Date().toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
        router.push(`/results?${urlParams.toString()}`);
      }}
    />
  );
}
