"use client";

import { RecentPage } from "@/domains/recent";
import { useRouter } from "next/navigation";

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
      onNavigateToRouteSearch={(from, to) => {
        console.log(`Pre-populate route search: ${from} → ${to}`);
        router.push("/");
      }}
    />
  );
}
