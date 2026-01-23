"use client";

import { BusStopInfoV2Container } from "@/domains/bus-stop";
import type {
  UpcomingBusEnrichedData,
  StopNameListData,
} from "@/domains/bus-stop/types";

interface BusStopInfoPageWrapperProps {
  busStopId: string;
  initialData: {
    upcomingData: UpcomingBusEnrichedData | null;
    stopData: StopNameListData | null;
  };
}

export function BusStopInfoPageWrapper({
  busStopId,
  initialData,
}: BusStopInfoPageWrapperProps) {
  return <BusStopInfoV2Container busStopId={busStopId} initialData={initialData} />;
}
