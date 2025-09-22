"use client";

import { BusStopSearchPage } from "@/components/page/BusStopSearchPage/BusStopSearchPage";
import { useRouter } from "next/navigation";

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
