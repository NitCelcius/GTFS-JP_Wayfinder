"use client";

import { useRouter } from "next/navigation";

import { RouteSearchPage } from "@/domains/route-search";

export default function HomePage() {
  const router = useRouter();

  const handleSearch = (searchParams: {
    originStopId: string;
    destinationStopId: string;
    originStopName: string;
    destinationStopName: string;
    beginTime: string;
  }) => {
    console.log("� Navigating to results with search params:", searchParams);

    // Navigate to results page with search parameters
    const urlParams = new URLSearchParams({
      search: "true",
      from: searchParams.originStopId,
      to: searchParams.destinationStopId,
      fromName: searchParams.originStopName,
      toName: searchParams.destinationStopName,
      time: searchParams.beginTime,
    });

    router.push(`/results?${urlParams.toString()}`);
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
