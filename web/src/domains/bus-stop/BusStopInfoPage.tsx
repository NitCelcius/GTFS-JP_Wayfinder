import { Info } from "lucide-react";

import { useEffect, useState } from "react";

import { BottomNavigation, JourneyTimeline } from "@/components/common";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";
import { useBottomNavigation, useTimeDisplay } from "@/hooks";

import styles from "./BusStopInfoPage.module.css";
import { ShareModal } from "./ShareModal";
import { useBusStopData } from "./hooks";
import { BusStopHeader } from "./internal/BusStopHeader";
import { NextBusInfo } from "./internal/NextBusInfo";
import { TransferButton } from "./internal/TransferButton";
import { WalkDirectionButton } from "./internal/WalkDirectionButton";

interface BusStopInfoPageProps {
  busStopId?: string;
  onBack?: () => void;
  onNavigateToRoute?: () => void;
  onNavigateToRecent?: () => void;
}

export function BusStopInfoPage({
  busStopId,
  onBack,
  onNavigateToRoute,
  onNavigateToRecent,
}: BusStopInfoPageProps) {
  const { busStop, busesWithJourneys, bestBusIndex, isLoading, error } =
    useBusStopData(busStopId);
  const timeDisplay = useTimeDisplay();
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentBusIndex, setCurrentBusIndex] = useState(0);

  // Sync to best bus when data loads
  useEffect(() => {
    setCurrentBusIndex(bestBusIndex);
  }, [bestBusIndex]);

  const handleBottomNavClick = useBottomNavigation("bus-stop", {
    onNavigateToRoute,
    onNavigateToRecent,
  });

  const handleTransferClick = () => {
    // TODO: Implement transfer functionality
    console.log("Navigate to transfer options");
  };

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
  };

  const handlePreviousBus = () => {
    if (currentBusIndex > 0) {
      setCurrentBusIndex(currentBusIndex - 1);
    }
  };

  const handleNextBus = () => {
    if (currentBusIndex < busesWithJourneys.length - 1) {
      setCurrentBusIndex(currentBusIndex + 1);
    }
  };

  const InfoIcon = () => <Info size={24} aria-hidden="true" />;

  // Handle error state
  if (error && !isLoading) {
    return (
      <div className={styles.errorContainer}>
        <TopNavigation
          icon={<InfoIcon />}
          title="バス停情報"
          showBackButton={true}
          onBack={onBack}
        />
        <div className={styles.errorContent}>
          <div className="text-center">
            <p className={styles.errorTextRed}>エラーが発生しました</p>
            <p className={styles.errorTextSmall}>{error}</p>
          </div>
        </div>
        <BottomNavigation
          activeTab="bus-stop"
          onTabClick={handleBottomNavClick}
        />
      </div>
    );
  }

  const busStopData = busStop;
  const currentBusData = busesWithJourneys[currentBusIndex];

  return (
    <>
      <div className={styles.page}>
        <TopNavigation
          icon={<InfoIcon />}
          title="バス停情報"
          showBackButton={true}
          onBack={onBack}
        />

        <div className={styles.content}>
          {/* Bus Stop Header */}
          {busStopData ? (
            <BusStopHeader
              name={busStopData.name}
              platformCode={busStopData.platformCode}
              distance={busStopData.distance || ""}
              busStopId={busStopId}
              onShareClick={handleShareClick}
            />
          ) : (
            <div className={styles.loadingHeader}>
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-gray-600">
                バス停情報を読み込み中...
              </span>
            </div>
          )}

          {/* Next Bus Info */}
          <div className={styles.nextBusWrapper}>
            {isLoading || busesWithJourneys.length === 0 ? (
              <div className={styles.panel}>
                <div className={styles.panelColumn}>
                  <LoadingSpinner size="sm" />
                  <span className={styles.panelTextSm}>
                    次のバス情報を読み込み中...
                  </span>
                </div>
              </div>
            ) : currentBusData ? (
              <NextBusInfo
                busInfo={currentBusData.busInfo}
                canShowPrevious={currentBusIndex > 0}
                canShowNext={currentBusIndex < busesWithJourneys.length - 1}
                onPreviousBus={handlePreviousBus}
                onNextBus={handleNextBus}
              />
            ) : (
              <div className={styles.panelCentered}>
                <span className="text-gray-600">
                  現在運行中のバスがありません
                </span>
              </div>
            )}
          </div>

          {/* Walk Direction Button */}
          {busStopData?.lat && busStopData?.lon && (
            <div className={styles.walkButtonWrapper}>
              <WalkDirectionButton
                lat={busStopData.lat}
                lon={busStopData.lon}
              />
            </div>
          )}

          {/* Route Journey */}
          <div className={styles.journeyWrapper}>
            {isLoading || !currentBusData ? (
              <div className={styles.journeyLoading}>
                <h3 className={styles.journeyTitle}>このバスの行き先</h3>
                <div className={styles.journeyBody}>
                  <div className={styles.panelColumn}>
                    <LoadingSpinner size="sm" />
                    <span className={styles.panelTextSm}>
                      行き方情報を読み込み中...
                    </span>
                  </div>
                </div>
              </div>
            ) : currentBusData.routeJourney.length > 0 ? (
              <JourneyTimeline
                title="このバスの行き先"
                stops={currentBusData.routeJourney}
                renderRightContent={(stop) => (
                  <>
                    {stop.cost !== undefined && stop.cost > 0 && (
                      <div className={styles.costWrapper}>
                        <span className={styles.costInline}>
                          <span className={styles.costValue}>{stop.cost}</span>
                          <span className={styles.yen}>円</span>
                        </span>
                      </div>
                    )}
                    <div className={styles.timeCol}>
                      {stop.arrivalTime &&
                      stop.departureTime &&
                      stop.arrivalTime === stop.departureTime ? (
                        <div className={styles.timeLine}>
                          <span className={styles.timeText}>
                            {stop.arrivalDatetime
                              ? timeDisplay.format(
                                  stop.arrivalDatetime,
                                  stop.arrivalTime
                                )
                              : stop.arrivalTime}
                          </span>
                        </div>
                      ) : (
                        <>
                          {stop.arrivalTime && (
                            <div className={styles.timeLine}>
                              <span className={styles.timeText}>
                                {stop.arrivalDatetime
                                  ? timeDisplay.format(
                                      stop.arrivalDatetime,
                                      stop.arrivalTime
                                    )
                                  : stop.arrivalTime}{" "}
                                着
                              </span>
                            </div>
                          )}
                          {stop.departureTime && (
                            <div className={styles.timeLine}>
                              <span className={styles.timeText}>
                                {stop.departureDatetime
                                  ? timeDisplay.format(
                                      stop.departureDatetime,
                                      stop.departureTime
                                    )
                                  : stop.departureTime}{" "}
                                発
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              />
            ) : (
              <div className={styles.journeyLoading}>
                <h3 className={styles.journeyTitle}>このバスの行き先</h3>
                <div className={styles.journeyBody}>
                  <span className="text-gray-600">経路情報がありません</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <BottomNavigation
          activeTab="bus-stop"
          onTabClick={handleBottomNavClick}
        />
      </div>

      {/* Floating Transfer Button */}
      <TransferButton onClick={handleTransferClick} floating={true} />

      {/* Share Modal */}
      {busStopId && busStopData && (
        <ShareModal
          shareUrl={`/bus-stop/${busStopId}`}
          title={`${busStopData.name} - バス停情報`}
          isOpen={showShareModal}
          onClose={handleCloseShareModal}
        />
      )}
    </>
  );
}
