"use client";

import { useRouter } from "next/navigation";

import { RecentBusStopsContainer } from "@/domains/recent";

export default function RecentBusStopsPageRoute() {
  const router = useRouter();

  const gotoBusStopInfo = (id: string) => {
    router.push(`/bus-stop/${encodeURIComponent(id)}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <RecentBusStopsContainer
      onNavigateToBusStopInfo={gotoBusStopInfo}
      onBack={handleBack}
    />
  );
}
