import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { JourneyTimeline } from "@/components/common/JourneyTimeline/JourneyTimeline";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";
import { useTimeDisplay } from "@/hooks";

import styles from "./BusStopInfoPage.module.css";
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
  const { data, isLoading, error } = useBusStopData(busStopId);
  const timeDisplay = useTimeDisplay();

  const handleBottomNavClick = (tab: "bus-stop" | "route" | "recent") => {
    switch (tab) {
      case "route":
        onNavigateToRoute?.();
        break;
      case "recent":
        onNavigateToRecent?.();
        break;
      default:
        // Already on bus stop related page
        break;
    }
  };

  const handleTransferClick = () => {
    // TODO: Implement transfer functionality
    console.log("Navigate to transfer options");
  };

  const InfoIcon = () => (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );

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

  const busStopData = data?.busStop;
  const nextBus = data?.nextBus;
  const routeJourney = data?.routeJourney || [];

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
              distance={busStopData.distance || ""}
            />
          ) : (
            <div className={styles.loadingHeader}>
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-gray-600">
                バス停情報を読み込み中...
              </span>
            </div>
          )}

          {/* Walk Direction Button */}
          {busStopData?.lat && busStopData?.lon && (
            <div className={styles.walkButtonWrapper}>
              <WalkDirectionButton
                lat={busStopData.lat}
                lon={busStopData.lon}
              />
            </div>
          )}

          {/* Next Bus Info */}
          <div className={styles.nextBusWrapper}>
            {isLoading || !data ? (
              <div className={styles.panel}>
                <div className={styles.panelColumn}>
                  <LoadingSpinner size="sm" />
                  <span className={styles.panelTextSm}>
                    次のバス情報を読み込み中...
                  </span>
                </div>
              </div>
            ) : nextBus ? (
              <NextBusInfo busInfo={nextBus} />
            ) : (
              <div className={styles.panelCentered}>
                <span className="text-gray-600">
                  現在運行中のバスがありません
                </span>
              </div>
            )}
          </div>

          {/* Route Journey */}
          <div className={styles.journeyWrapper}>
            {isLoading || !data ? (
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
            ) : routeJourney.length > 0 ? (
              <JourneyTimeline
                title="このバスの行き先"
                stops={routeJourney}
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
    </>
  );
}
