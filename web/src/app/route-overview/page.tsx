"use client";

import { Suspense } from "react";

import { useRouter } from "next/navigation";

import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { RouteOverviewPageContainer } from "@/domains/route-search";

import styles from "./page.module.css";

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
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
        </div>
      }
    >
      <RouteOverviewContent />
    </Suspense>
  );
}
