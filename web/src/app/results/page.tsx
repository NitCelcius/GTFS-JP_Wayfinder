"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { SearchResultPage } from "@/domains/route-search";
import type { TripDetails } from "@/domains/route-search/SearchResultPage/types";
import mockTripDetails from "@/mocks/data";

// Disable static generation for this dynamic page
export const dynamic = "force-dynamic";

export default function ResultsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);

  useEffect(() => {
    setTripDetails(mockTripDetails);
    setIsLoading(false);
  }, []);

  const handleRouteSelect = (routeId: string) => {
    setTripDetails((prev) =>
      prev ? { ...prev, selectedRouteId: routeId } : null
    );
  };

  if (isLoading || !tripDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading search results...</div>
      </div>
    );
  }

  return (
    <SearchResultPage
      tripDetails={tripDetails}
      onRouteSelect={handleRouteSelect}
      onBack={() => router.push("/")}
      onNavigateToBusStop={() => router.push("/bus-stop")}
      onNavigateToRecent={() => router.push("/recent")}
      isLoading={false}
    />
  );
}
