import { useEffect, useState } from "react";

import { ErrorBoundary } from "@/components/common";

import { useBusStopData } from "../hooks";
import type { BusWithJourney } from "../types";
import { BusTripDetail } from "./BusTripDetail";

interface BusTripDetailContainerProps {
  busStopId?: string;
  onBack?: () => void;
}

/**
 * Container component for BusTripDetail that handles data fetching and API integration
 */
export function BusTripDetailContainer({
  busStopId,
  onBack,
}: BusTripDetailContainerProps) {
  const { busStop, busesWithJourneys, bestBusIndex, isLoading, error } =
    useBusStopData(busStopId);
  const [currentBusIndex, setCurrentBusIndex] = useState(0);

  // Sync to best bus when data loads
  useEffect(() => {
    setCurrentBusIndex(bestBusIndex);
  }, [bestBusIndex]);

  // Handle loading state
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: "16px",
          color: "var(--foregroundl2)",
        }}
      >
        読み込み中...
      </div>
    );
  }

  // Handle error state
  if (error || !busStop) {
    return (
      <ErrorBoundary
        message={error || "バス停情報を読み込めませんでした"}
      />
    );
  }

  // Handle no buses available
  if (busesWithJourneys.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          padding: "20px",
        }}
      >
        <p style={{ fontSize: "16px", color: "var(--foregroundl2)" }}>
          現在運行中のバスがありません
        </p>
      </div>
    );
  }

  const currentBus = busesWithJourneys[currentBusIndex];

  // Convert domain data to component props
  const tripDetailProps = convertBusDataToTripDetail(
    busStop.name,
    currentBus,
    busStop.id
  );

  return <BusTripDetail {...tripDetailProps} onBack={onBack} />;
}

/**
 * Convert domain data to BusTripDetail component props
 */
function convertBusDataToTripDetail(
  stopName: string,
  busWithJourney: BusWithJourney,
  currentStopId: string
) {
  const { busInfo, routeJourney } = busWithJourney;

  // Calculate arrival minutes (difference between current time and arrival)
  const now = new Date();
  const arrivalDate = busInfo.arrivalDatetime;
  const diffMs = arrivalDate.getTime() - now.getTime();
  const arrivalMinutes = Math.max(0, Math.round(diffMs / 60000));

  // Find current stop index to calculate stops away
  const currentStopIndex = routeJourney.findIndex(
    (stop) => stop.id === currentStopId
  );
  const busLocationIndex = routeJourney.findIndex(
    (stop) => stop.type === "current"
  );

  let stopsAway = 0;
  if (busLocationIndex >= 0 && currentStopIndex >= 0) {
    stopsAway = currentStopIndex - busLocationIndex;
  }

  // Convert journey stops to component format
  const stops = routeJourney.map((stop, index) => {
    const isCurrentStop = stop.id === currentStopId;
    const isBusLocation = stop.type === "current" && !isCurrentStop;
    const isDestination = stop.type === "destination";
    // Mark as passed if this stop is before the bus location
    const isPassed = busLocationIndex >= 0 && index < busLocationIndex;

    return {
      id: stop.id,
      name: stop.name,
      arrivalTime: stop.arrivalTime || stop.time,
      fare: stop.cost,
      isCurrent: isCurrentStop,
      isBusLocation,
      isDestination,
      isPassed,
    };
  });

  return {
    stopName,
    routeNumber: busInfo.line,
    routeName: busInfo.system,
    destinationName: busInfo.destination,
    arrivalMinutes,
    arrivalTime: busInfo.arrivalTime,
    stopsAway,
    stops,
  };
}
