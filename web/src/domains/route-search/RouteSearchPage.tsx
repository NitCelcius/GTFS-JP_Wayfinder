import { MapPinned } from "lucide-react";

import { useState } from "react";

import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { RouteSearchButton } from "@/components/common/RouteSearchButton/RouteSearchButton";
import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";
import { getCurrentTimeString } from "@/lib/utils";
import type { BusStopSearchResult, RouteSearchState } from "@/types";

import styles from "./RouteSearchPage.module.css";
import { RouteInputs } from "./internal/RouteInputs";
import { SearchConditions } from "./internal/SearchConditions";

interface MainContentProps {
  onSearch?: () => Promise<void>;
  originValue: string;
  destinationValue: string;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onOriginStopSelect?: (result: BusStopSearchResult) => void;
  onDestinationStopSelect?: (result: BusStopSearchResult) => void;
  isLoading?: boolean;
}

function MainContent({
  onSearch,
  originValue,
  destinationValue,
  onOriginChange,
  onDestinationChange,
  onOriginStopSelect,
  onDestinationStopSelect,
  isLoading = false,
}: MainContentProps) {
  const isSearchEnabled =
    originValue.trim() && destinationValue.trim() && !isLoading;

  return (
    <div className={styles.mainContent}>
      <RouteInputs
        originValue={originValue}
        destinationValue={destinationValue}
        onOriginChange={onOriginChange}
        onDestinationChange={onDestinationChange}
        onOriginStopSelect={onOriginStopSelect}
        onDestinationStopSelect={onDestinationStopSelect}
      />
      <SearchConditions />
      <RouteSearchButton
        onClick={onSearch || (() => {})}
        disabled={!isSearchEnabled}
        isLoading={isLoading}
      />
    </div>
  );
}

interface RouteSearchPageProps {
  onSearch?: (searchParams: {
    originStopId: string;
    destinationStopId: string;
    originStopName: string;
    destinationStopName: string;
    beginTime: string;
  }) => void;
  onNavigateToBusStop?: () => void;
  onNavigateToRecent?: () => void;
}

export function RouteSearchPage({
  onSearch,
  onNavigateToBusStop,
  onNavigateToRecent,
}: RouteSearchPageProps) {
  const [originValue, setOriginValue] = useState("");
  const [destinationValue, setDestinationValue] = useState("");
  const [originCandidateStopIds, setOriginCandidateStopIds] = useState<
    string[]
  >([]);
  const [destinationCandidateStopIds, setDestinationCandidateStopIds] =
    useState<string[]>([]);
  const [routeSearchState, setRouteSearchState] = useState<RouteSearchState>({
    isLoading: false,
    result: null,
    error: null,
  });

  const handleOriginStopSelect = (result: BusStopSearchResult) => {
    setOriginCandidateStopIds(result.candidate_stop_id_list);
    console.log("Origin bus stop selected:", {
      stop_name: result.stop_name,
      candidate_stop_id_list: result.candidate_stop_id_list,
    });
  };

  const handleDestinationStopSelect = (result: BusStopSearchResult) => {
    setDestinationCandidateStopIds(result.candidate_stop_id_list);
    console.log("Destination bus stop selected:", {
      stop_name: result.stop_name,
      candidate_stop_id_list: result.candidate_stop_id_list,
    });
  };

  const handleBottomNavClick = (tab: "bus-stop" | "route" | "recent") => {
    switch (tab) {
      case "bus-stop":
        onNavigateToBusStop?.();
        break;
      case "recent":
        onNavigateToRecent?.();
        break;
      default:
        // Already on route page
        break;
    }
  };

  const handleSearch = async () => {
    // Use the first candidate stop ID from each selection
    // TODO: implement multiple candidates handling
    const originStopId = originCandidateStopIds[0];
    const destinationStopId = destinationCandidateStopIds[0];

    if (!originStopId || !destinationStopId) {
      setRouteSearchState({
        isLoading: false,
        result: null,
        error: "Please select valid bus stops for both origin and destination",
      });
      return;
    }

    // Use current time as the begin_time
    const beginTime = getCurrentTimeString();

    // Pass search parameters to parent (which will navigate to results page)
    const searchParams = {
      originStopId,
      destinationStopId,
      originStopName: originValue,
      destinationStopName: destinationValue,
      beginTime,
    };

    console.log("Search initiated with params:", searchParams);
    onSearch?.(searchParams);
  };

  return (
    <div className={styles.page}>
      <TopNavigation icon={<MapPinned size={24} />} title="経路探索" />
      <div className={styles.main}>
        <MainContent
          onSearch={handleSearch}
          originValue={originValue}
          destinationValue={destinationValue}
          onOriginChange={setOriginValue}
          onDestinationChange={setDestinationValue}
          onOriginStopSelect={handleOriginStopSelect}
          onDestinationStopSelect={handleDestinationStopSelect}
          isLoading={routeSearchState.isLoading}
        />
      </div>
      <BottomNavigation activeTab="route" onTabClick={handleBottomNavClick} />
    </div>
  );
}
