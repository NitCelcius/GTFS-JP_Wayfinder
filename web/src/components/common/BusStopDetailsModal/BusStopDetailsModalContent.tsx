import { useEffect, useRef, useState } from "react";

import type { EnrichedTrip } from "@/api/types.gen";

import styles from "./BusStopDetailsModal.module.css";

export interface BusStopDetails {
  stopId: string;
  stopName: string;
  location?: {
    lat: number;
    lon: number;
  };
  upcomingBuses: EnrichedTrip[];
}

interface BusStopDetailsModalContentProps {
  isOpen: boolean;
  onClose: () => void;
  details: BusStopDetails | null;
  isLoading: boolean;
  error: string | null;
}

export function BusStopDetailsModalContent({
  isOpen,
  onClose,
  details,
  isLoading,
  error,
}: BusStopDetailsModalContentProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Reset map loaded state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMapLoaded(false);
    }
  }, [isOpen]);

  // Lazy load the map when details are available
  useEffect(() => {
    if (details?.location && mapContainerRef.current && !mapLoaded) {
      // Simulate map loading - in production, you'd integrate with a real map library
      const timer = setTimeout(() => {
        setMapLoaded(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [details, mapLoaded]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.modal} onClick={handleModalClick}>
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            {details?.stopName || "バス停"}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="閉じる"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width={32}
              height={32}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <div className={styles.loadingText}>読み込み中...</div>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <svg
                className={styles.errorIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div className={styles.errorTitle}>エラーが発生しました</div>
              <div className={styles.errorDescription}>{error}</div>
            </div>
          ) : details ? (
            <>
              {/* Location section */}
              {details.location && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>位置情報</h3>
                  <div className={styles.locationInfo}>
                    <p className={styles.coordinates}>
                      緯度: {details.location.lat.toFixed(5)}, 経度:{" "}
                      {details.location.lon.toFixed(5)}
                    </p>
                  </div>

                  {/* Map container */}
                  <div ref={mapContainerRef} className={styles.mapContainer}>
                    {!mapLoaded ? (
                      <div className={styles.mapLoading}>
                        <div className={styles.mapSpinner} />
                        <p>地図を読み込んでいます...</p>
                      </div>
                    ) : (
                      <div className={styles.mapPlaceholder}>
                        <svg
                          className={styles.mapIcon}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <p className={styles.mapText}>
                          地図: {details.location.lat.toFixed(4)},{" "}
                          {details.location.lon.toFixed(4)}
                        </p>
                        <p className={styles.mapSubtext}>
                          ※ 地図ライブラリ統合予定
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Upcoming buses section */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>発着予定</h3>
                {details.upcomingBuses.length === 0 ? (
                  <p className={styles.noData}>
                    現在、予定されている便はありません。
                  </p>
                ) : (
                  <div className={styles.busList}>
                    {details.upcomingBuses.map((bus, index) => (
                      <div
                        key={`${bus.trip_id}-${index}`}
                        className={styles.busItem}
                      >
                        <div className={styles.busTime}>
                          {bus.arrival_time && (
                            <div className={styles.timeRow}>
                              <span className={styles.timeLabel}>到着</span>
                              <span className={styles.timeValue}>
                                {bus.arrival_time}
                              </span>
                            </div>
                          )}
                          {bus.departure_time && (
                            <div className={styles.timeRow}>
                              <span className={styles.timeLabel}>出発</span>
                              <span className={styles.timeValue}>
                                {bus.departure_time}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className={styles.busInfo}>
                          <span className={styles.tripId}>{bus.trip_id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
