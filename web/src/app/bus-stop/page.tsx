"use client";

import { useRouter } from "next/navigation";

import { BusStopSearchPage } from "@/domains/bus-stop";

export default function BusStopSearchPageRoute() {
  const router = useRouter();

  const navigateToInfo = (id: string) => {
    // Navigate to bus-stop/[id] using dynamic route
    router.push(`/bus-stop/${encodeURIComponent(id)}`);
  };

  return (
    <BusStopSearchPage
      onNavigateToRoute={() => router.push("/")}
      onNavigateToRecent={() => router.push("/recent")}
      onNavigateToBusStopInfo={navigateToInfo}
    />
  );
}
