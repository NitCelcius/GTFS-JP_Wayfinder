"use client";

import { RouteSearchPage } from "@/components/page/RouteSearchPage/RouteSearchPage";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleSearch = () => {
    // Navigate to results page; any loading state can be handled in-page if needed
    router.push("/results");
  };

  return (
    <RouteSearchPage
      onSearch={handleSearch}
      onNavigateToBusStop={() => router.push("/bus-stop")}
      onNavigateToRecent={() => router.push("/recent")}
    />
  );
}
