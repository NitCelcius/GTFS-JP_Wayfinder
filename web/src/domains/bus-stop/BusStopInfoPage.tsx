import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { JourneyTimeline } from "@/components/common/JourneyTimeline/JourneyTimeline";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";

import { useBusStopData } from "./hooks";
import { BusStopHeader } from "./internal/BusStopHeader";
import { NextBusInfo } from "./internal/NextBusInfo";
import { TransferButton } from "./internal/TransferButton";

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
      <div className="bg-white min-h-screen w-full max-w-[var(--max-w-mobile)] mx-auto flex flex-col relative pb-[calc(var(--size-container-md)+6rem)]">
        <TopNavigation
          icon={<InfoIcon />}
          title="バス停情報"
          showBackButton={true}
          onBack={onBack}
        />
        <div className="flex-1 flex items-center justify-center p-[var(--size-spacing-lg)]">
          <div className="text-center">
            <p className="text-red-600 mb-4">エラーが発生しました</p>
            <p className="text-gray-600 text-sm">{error}</p>
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
      <div className="bg-white min-h-screen w-full max-w-[var(--max-w-mobile)] mx-auto flex flex-col relative pb-[calc(var(--size-container-md)+6rem)]">
        <TopNavigation
          icon={<InfoIcon />}
          title="バス停情報"
          showBackButton={true}
          onBack={onBack}
        />

        <div className="flex-1 flex flex-col px-[var(--size-spacing-lg)] overflow-auto">
          {/* Bus Stop Header */}
          {busStopData ? (
            <BusStopHeader
              name={busStopData.name}
              distance={busStopData.distance || ""}
            />
          ) : (
            <div className="h-[60px] flex items-center">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-gray-600">
                バス停情報を読み込み中...
              </span>
            </div>
          )}

          {/* Next Bus Info */}
          <div className="pt-[var(--size-spacing-2xl)]">
            {isLoading || !data ? (
              <div className="w-full bg-white border border-gray-200 rounded-[var(--radius-lg)] p-[var(--size-spacing-2xl)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-[var(--size-spacing-md)]">
                  <LoadingSpinner size="sm" />
                  <span className="text-[0.875rem] text-gray-600">
                    次のバス情報を読み込み中...
                  </span>
                </div>
              </div>
            ) : nextBus ? (
              <NextBusInfo busInfo={nextBus} />
            ) : (
              <div className="w-full bg-white border border-gray-200 rounded-[var(--radius-lg)] p-[var(--size-spacing-2xl)] text-center">
                <span className="text-gray-600">
                  現在運行中のバスがありません
                </span>
              </div>
            )}
          </div>

          {/* Route Journey */}
          <div className="pt-[var(--size-spacing-2xl)] flex-1 min-h-0">
            {isLoading || !data ? (
              <div className="h-full flex flex-col">
                <h3 className="text-[1.125rem] mb-[var(--size-spacing-lg)]">
                  このバスの行き先
                </h3>
                <div className="flex-1 bg-white border border-gray-200 rounded-[var(--radius-lg)] p-[var(--size-spacing-2xl)] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-[var(--size-spacing-md)]">
                    <LoadingSpinner size="sm" />
                    <span className="text-[0.875rem] text-gray-600">
                      経路情報を読み込み中...
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
                      <div className="flex items-center justify-center">
                        <span className="flex items-baseline gap-1">
                          <span className="text-[var(--text-xl)]">
                            {stop.cost}
                          </span>
                          <span className="text-sm">円</span>
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col items-end gap-[var(--size-spacing-xs)] flex-0">
                      {stop.arrivalTime && (
                        <div className="flex flex-0 whitespace-nowrap items-end">
                          <span className="text-[var(--text-base)] whitespace-nowrap">
                            {stop.arrivalTime} 着
                          </span>
                        </div>
                      )}
                      {stop.departureTime && (
                        <div className="flex flex-0 whitespace-nowrap items-end">
                          <span className="text-[var(--text-base)] whitespace-nowrap">
                            {stop.departureTime} 発
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              />
            ) : (
              <div className="h-full flex flex-col">
                <h3 className="text-[1.125rem] mb-[var(--size-spacing-lg)]">
                  このバスの行き先
                </h3>
                <div className="flex-1 bg-white border border-gray-200 rounded-[var(--radius-lg)] p-[var(--size-spacing-2xl)] flex items-center justify-center">
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
