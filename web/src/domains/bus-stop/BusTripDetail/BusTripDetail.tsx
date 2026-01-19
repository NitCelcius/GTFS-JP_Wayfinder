import { ChevronLeft, Share2 } from "lucide-react";

import { useState } from "react";

import { ShareModal } from "@/domains/bus-stop";

import styles from "./BusTripDetail.module.css";
import type { Stop } from "./internal/StopItem";
import { StopsList } from "./internal/StopsList";
import { TripIndicator } from "./internal/TripIndicator";

export interface BusTripDetailProps {
  tripId?: string;
  stopId?: string;
  stopName: string;
  routeNumber: string;
  routeName: string;
  destinationName: string;
  arrivalMinutes: number;
  arrivalTime: string;
  departureTime?: string;
  stopsAway: number;
  stops: Stop[];
  /** Text used for color generation (typically route_name or route_id) */
  routeColorText?: string;
  onBack?: () => void;
}

export function BusTripDetail({
  tripId,
  stopId,
  stopName,
  routeNumber,
  routeName,
  destinationName,
  arrivalMinutes,
  arrivalTime,
  departureTime,
  stopsAway,
  stops,
  routeColorText,
  onBack,
}: BusTripDetailProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <div className={styles.container}>
      {/* Bus Stop Header */}
      <div className={styles.busStopHeader}>
        <div className={styles.busStopHeaderContent}>
          <button
            onClick={onBack}
            className={styles.backButton}
            aria-label="戻る"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
          <h2 className={styles.stopName}>{stopName}</h2>
          {tripId && stopId && (
            <button
              onClick={() => setIsShareModalOpen(true)}
              className={styles.shareButton}
              aria-label="共有"
            >
              <Share2 size={24} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className={styles.divider} />
      </div>

      {/* Trip Indicator */}
      <div className={styles.tripIndicator}>
        <TripIndicator
          routeNumber={routeNumber}
          routeName={routeName}
          destinationName={destinationName}
          arrivalMinutes={arrivalMinutes}
          arrivalTime={arrivalTime}
          stopsAway={stopsAway}
          routeColorText={routeColorText}
        />
      </div>

      {/* Stops List */}
      <div className={styles.stopsContainer}>
        <h3 className={styles.stopsTitle}>このバスの行き先</h3>
        <div className={styles.stopsScrollArea}>
          <StopsList stops={stops} />
        </div>
      </div>

      {/* Share Modal */}
      {tripId && stopId && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          shareUrl={`/trips/${encodeURIComponent(tripId)}?stop_id=${stopId}`}
          title={`このバスを共有`}
          description={`${stopName}を ${departureTime || arrivalTime} に出発する、${routeName} ${destinationName}行きのバスを共有します`}
        />
      )}
    </div>
  );
}
