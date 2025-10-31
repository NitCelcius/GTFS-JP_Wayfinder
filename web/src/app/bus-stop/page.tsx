"use client";

import { useRouter } from "next/navigation";

import { BusStopSearchPage } from "@/domains/bus-stop";
import { useBusStopSearchHistory } from "@/hooks/useSearchHistory";

export default function BusStopSearchPageRoute() {
  const router = useRouter();
  const { addSearch } = useBusStopSearchHistory();

  const navigateToInfo = async (
    id: string,
    name?: string,
    distance?: string
  ) => {
    // Save to history before navigating
    if (name && distance) {
      await addSearch(id, name, distance);
    }

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
