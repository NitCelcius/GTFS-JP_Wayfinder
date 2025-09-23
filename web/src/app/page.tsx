"use client";

import { RouteSearchPage } from "@/domains/route-search";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleSearch = () => {
    // Navigate to results page; any loading state can be handled in-page if needed
    router.push("/results");
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <RouteSearchPage
        onSearch={handleSearch}
        onNavigateToBusStop={() => router.push("/bus-stop")}
        onNavigateToRecent={() => router.push("/recent")}
      />
    </div>
  );
}
