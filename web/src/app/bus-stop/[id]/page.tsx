import type {
  StopNameListData,
  UpcomingBusEnrichedData,
} from "@/domains/bus-stop/types";
import { createServerApiClient } from "@/lib/apiServer";

import { BusStopInfoPageWrapper } from "./BusStopInfoPageWrapper";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BusStopInfoPageRoute({ params }: PageProps) {
  const resolvedParams = await params;
  const busStopId = decodeURIComponent(resolvedParams.id);

  // Fetch bus stop data server-side
  const initialData: {
    upcomingData: UpcomingBusEnrichedData | null;
    stopData: StopNameListData | null;
  } = {
    upcomingData: null,
    stopData: null,
  };

  try {
    const apiServer = createServerApiClient();

    // Get current time in HH:MM:SS format
    const now = new Date();
    const beginTime = now.toTimeString().split(" ")[0];

    // Fetch upcoming buses with trip info (server-side)
    const [upcomingResponse, stopResponse] = await Promise.allSettled([
      apiServer.getBusStopInfoExpanded(busStopId, undefined, 50, beginTime),
      apiServer.getStopInfo(busStopId, true),
    ]);

    if (upcomingResponse.status === "fulfilled") {
      initialData.upcomingData = upcomingResponse.value
        .data as UpcomingBusEnrichedData;
    }

    if (stopResponse.status === "fulfilled") {
      initialData.stopData = stopResponse.value.data as StopNameListData;
    }
  } catch (error) {
    console.error("Failed to fetch bus stop data server-side:", error);
    // Continue with null data, container will handle error state
  }

  return (
    <BusStopInfoPageWrapper busStopId={busStopId} initialData={initialData} />
  );
}
