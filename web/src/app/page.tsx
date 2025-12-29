"use client";

import { useRouter } from "next/navigation";

import { RouteSearchPage } from "@/domains/route-search";
import { useRouteSearchHistory } from "@/hooks/useSearchHistory";

export default function HomePage() {
  const router = useRouter();
  const { addSearch } = useRouteSearchHistory();

  const handleSearch = async (searchParams: {
    originStopId: string;
    destinationStopId: string;
    originStopName: string;
    destinationStopName: string;
    beginTime: string;
  }) => {
    console.log("🔍 Navigating to route-overview with search params:", searchParams);

    // Save to history before navigating
    await addSearch(
      searchParams.originStopId,
      searchParams.destinationStopId,
      searchParams.originStopName,
      searchParams.destinationStopName
    );

    // Navigate to route-overview page with search parameters
    const urlParams = new URLSearchParams({
      from: searchParams.originStopId,
      to: searchParams.destinationStopId,
      fromName: searchParams.originStopName,
      toName: searchParams.destinationStopName,
      time: searchParams.beginTime,
    });

    router.push(`/route-overview?${urlParams.toString()}`);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Status indicator */}

      {/* Main content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <RouteSearchPage
          onSearch={handleSearch}
          onNavigateToBusStop={() => router.push("/bus-stop")}
          onNavigateToRecent={() => router.push("/recent")}
        />
      </div>
    </div>
  );
}
