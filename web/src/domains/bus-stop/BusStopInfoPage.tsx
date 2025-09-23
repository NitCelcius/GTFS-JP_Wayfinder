import { useEffect, useState } from "react";

import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { JourneyTimeline } from "@/components/common/JourneyTimeline/JourneyTimeline";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";

import { BusStopHeader } from "./internal/BusStopHeader";
import { NextBusInfo } from "./internal/NextBusInfo";
import { TransferButton } from "./internal/TransferButton";

interface BusStopInfoPageProps {
  busStopId?: string;
  onBack?: () => void;
  onNavigateToRoute?: () => void;
  onNavigateToRecent?: () => void;
}

// Mock data for the bus stop
const mockBusStopData = {
  name: "上ノ橋駅",
  distance: "約10m",
  nextBus: {
    line: "篠山線",
    system: "系統400",
    destination: "篠山駅前",
    direction: "行",
    arrivalTime: "13:05",
    status: "当バス停着",
  },
  routeJourney: [
    {
      id: "stop1",
      name: "上ノ橋駅",
      type: "current" as const,
      time: "13:05",
      label: "現在地",
    },
    {
      id: "stop2",
      name: "一本杉",
      type: "intermediate" as const,
      time: "13:12",
      cost: 140,
    },
    {
      id: "stop3",
      name: "篠山駅前",
      type: "destination" as const,
      time: "13:18",
      cost: 180,
    },
  ],
};

export function BusStopInfoPage({
  // TODO: use id params when implementing real data fetching
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- will use this param later
  busStopId: _busStopId,
  onBack,
  onNavigateToRoute,
  onNavigateToRecent,
}: BusStopInfoPageProps) {
  const [isNextBusLoading, setIsNextBusLoading] = useState(true);
  const [isRouteJourneyLoading, setIsRouteJourneyLoading] = useState(true);

  // Simulate loading for next bus info
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNextBusLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Simulate loading for route journey (slightly longer)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRouteJourneyLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
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
    // Placeholder for transfer functionality
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
          <BusStopHeader
            name={mockBusStopData.name}
            distance={mockBusStopData.distance}
          />

          <div className="pt-[var(--size-spacing-2xl)]">
            {isNextBusLoading ? (
              <div className="w-full bg-white border border-gray-200 rounded-[var(--radius-lg)] p-[var(--size-spacing-2xl)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-[var(--size-spacing-md)]">
                  <LoadingSpinner size="sm" />
                  <span className="text-[0.875rem] text-gray-600">
                    次のバス情報を読み込み中...
                  </span>
                </div>
              </div>
            ) : (
              <NextBusInfo busInfo={mockBusStopData.nextBus} />
            )}
          </div>

          <div className="pt-[var(--size-spacing-2xl)] flex-1 min-h-0">
            {isRouteJourneyLoading ? (
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
            ) : (
              <JourneyTimeline
                title="このバスの行き先"
                stops={mockBusStopData.routeJourney}
                variant="bus-info"
              />
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
