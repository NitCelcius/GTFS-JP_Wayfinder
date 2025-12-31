"use client";

import { useRouter } from "next/navigation";

import { AllRecentBusStopsPage } from "@/domains/recent";

export default function AllRecentBusStopsPageContainer() {
  const router = useRouter();

  const gotoBusStopInfo = (id: string) => {
    router.push(`/bus-stop/${encodeURIComponent(id)}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <AllRecentBusStopsPage
      onNavigateToBusStopInfo={gotoBusStopInfo}
      onBack={handleBack}
    />
  );
}
