"use client";

import { useRouter } from "next/navigation";

import { RouteOverviewPageContainer } from "@/domains/route-search";

export const dynamic = "force-dynamic";

export default function RouteOverviewPage() {
  const router = useRouter();

  return (
    <RouteOverviewPageContainer
      onBack={() => router.push("/")}
      onNavigateToBusStop={() => router.push("/bus-stop")}
      onNavigateToRecent={() => router.push("/recent")}
    />
  );
}
