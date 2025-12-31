"use client";

import { useRouter } from "next/navigation";

import { RouteDetailPageContainer } from "@/domains/route-search";

// Static generation is disabled for this page because it fetches real-time bus information and search results
// based on user input (query parameters) at runtime. The data required to render this page cannot be determined
// at build time, so dynamic rendering is necessary to ensure up-to-date and personalized results.
// TODO: consider dynamic rendering needed
export const dynamic = "force-dynamic";

export default function ResultsPage() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <RouteDetailPageContainer
      onBack={handleBack}
      onNavigateToBusStop={() => router.push("/bus-stop")}
      onNavigateToRecent={() => router.push("/recent")}
    />
  );
}
