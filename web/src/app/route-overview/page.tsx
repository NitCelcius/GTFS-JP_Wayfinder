"use client";

import { Suspense } from "react";

import { useRouter } from "next/navigation";

import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { RouteOverviewPageContainer } from "@/domains/route-search";

export const dynamic = "force-dynamic";

function RouteOverviewContent() {
  const router = useRouter();

  return (
    <RouteOverviewPageContainer
      onBack={() => router.push("/")}
      onNavigateToBusStop={() => router.push("/bus-stop")}
      onNavigateToRecent={() => router.push("/recent")}
    />
  );
}

export default function RouteOverviewPageWrapper() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <LoadingSpinner />
        </div>
      }
    >
      <RouteOverviewContent />
    </Suspense>
  );
}
