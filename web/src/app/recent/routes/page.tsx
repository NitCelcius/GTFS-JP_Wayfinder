"use client";

import { useRouter } from "next/navigation";

import { AllRecentRoutesPage } from "@/domains/recent";

export default function AllRecentRoutesPageContainer() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <AllRecentRoutesPage
      onNavigateToRouteSearch={(
        fromStopId,
        toStopId,
        fromStation,
        toStation
      ) => {
        const urlParams = new URLSearchParams({
          search: "true",
          from: fromStopId,
          to: toStopId,
          fromName: fromStation,
          toName: toStation,
          time: new Date().toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
        router.push(`/results?${urlParams.toString()}`);
      }}
      onBack={handleBack}
    />
  );
}
