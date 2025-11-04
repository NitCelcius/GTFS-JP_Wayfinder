import { useEffect, useState } from "react";

import { apiClient } from "@/lib/api";

import {
  type BusStopDetails,
  BusStopDetailsModalContent,
} from "./BusStopDetailsModalContent";

interface BusStopDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stopName: string;
  stopId?: string | null;
}

export function BusStopDetailsModal({
  isOpen,
  onClose,
  stopName,
  stopId,
}: BusStopDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<BusStopDetails | null>(null);

  // Fetch bus stop details
  useEffect(() => {
    if (!isOpen) {
      setDetails(null);
      setError(null);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let actualStopId = stopId;

        // If no stopId provided, search for it by name
        if (!actualStopId) {
          const searchResponse = await apiClient.searchBusStops(
            stopName,
            false
          );
          if (searchResponse.data && searchResponse.data.stop_ids.length > 0) {
            actualStopId = searchResponse.data.stop_ids[0].stop_id;
          } else {
            throw new Error("バス停が見つかりませんでした");
          }
        }

        // Fetch upcoming buses
        const upcomingResponse = await apiClient.getBusStopInfo(actualStopId);

        // For now, we'll search nearby with a wide radius to find this stop
        // This is a workaround since the API doesn't have a direct location endpoint
        let location: { lat: number; lon: number } | undefined;

        // Try to get location from nearby stops by searching around a default location
        // This is a temporary solution - ideally we'd have a dedicated endpoint
        try {
          const nearbyStops = await apiClient.getNearbyStops(
            39.71676,
            140.13113,
            100
          );
          const matchingStop = nearbyStops.data?.stops.find(
            (s) => s.stop_id === actualStopId
          );
          if (matchingStop) {
            location = {
              lat: matchingStop.lat,
              lon: matchingStop.lon,
            };
          }
        } catch (e) {
          console.warn("Failed to fetch location:", e);
        }

        setDetails({
          stopId: actualStopId,
          stopName: stopName,
          location,
          upcomingBuses: upcomingResponse.data?.buses || [],
        });
      } catch (err) {
        console.error("Failed to fetch bus stop details:", err);
        setError("バス停情報の取得に失敗しました。もう一度お試しください。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, stopName, stopId]);

  return (
    <BusStopDetailsModalContent
      isOpen={isOpen}
      onClose={onClose}
      details={details}
      isLoading={isLoading}
      error={error}
    />
  );
}
