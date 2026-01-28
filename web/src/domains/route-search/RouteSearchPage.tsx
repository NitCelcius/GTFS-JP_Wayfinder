import { MapPinned } from "lucide-react";

import { useEffect, useState } from "react";

import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { RouteSearchButton } from "@/components/common/RouteSearchButton/RouteSearchButton";
import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";
import { useBottomNavigation } from "@/hooks";
import {
  getRouteSearchInputs,
  saveRouteSearchInputs,
} from "@/lib/routeSearchInputStorage";
import { getCurrentTimeString } from "@/lib/utils";
import type { BusStopSearchResult } from "@/types";

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
  const [shouldSaveInputs, setShouldSaveInputs] = useState(false);

  // Restore saved inputs on mount (if within 5 minutes)
  useEffect(() => {
    const savedInputs = getRouteSearchInputs();
    if (savedInputs) {
      console.debug("Restoring saved route search inputs:", {
        origin: savedInputs.originStopName,
        destination: savedInputs.destinationStopName,
        savedAt: new Date(savedInputs.timestamp).toISOString(),
      });
      setOriginValue(savedInputs.originStopName);
      setDestinationValue(savedInputs.destinationStopName);
      setOriginCandidateStopIds(savedInputs.originCandidateStopIds);
      setDestinationCandidateStopIds(savedInputs.destinationCandidateStopIds);
    }
  }, []);

  // Save inputs when search is initiated (triggered by handleSearch)
  useEffect(() => {
    if (shouldSaveInputs) {
      const originStopId = originCandidateStopIds[0];
      const destinationStopId = destinationCandidateStopIds[0];

      if (originStopId && destinationStopId) {
        saveRouteSearchInputs({
          originStopId,
          destinationStopId,
          originStopName: originValue,
          destinationStopName: destinationValue,
          originCandidateStopIds,
          destinationCandidateStopIds,
        });
        console.debug("Route search inputs saved to sessionStorage");
      }
      setShouldSaveInputs(false);
    }
  }, [
    shouldSaveInputs,
    originValue,
    destinationValue,
    originCandidateStopIds,
    destinationCandidateStopIds,
  ]);

  const handleOriginStopSelect = (result: BusStopSearchResult) => {
    const candidateIds = result.candidate_stop_id_list;
    setOriginCandidateStopIds(candidateIds);
  };

  const handleDestinationStopSelect = (result: BusStopSearchResult) => {
    const candidateIds = result.candidate_stop_id_list;
    setDestinationCandidateStopIds(candidateIds);
  };

  const handleBottomNavClick = useBottomNavigation("route", {
    onNavigateToBusStop,
    onNavigateToRecent,
  });

  const handleSearch = async () => {
    // Use the first candidate stop ID from each selection
    // TODO: implement multiple candidates handling
    const originStopId = originCandidateStopIds[0];
    const destinationStopId = destinationCandidateStopIds[0];

    if (!originStopId || !destinationStopId) {
      return;
    }

    // Trigger saving inputs to sessionStorage
    setShouldSaveInputs(true);

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
        />
      </div>
      <BottomNavigation activeTab="route" onTabClick={handleBottomNavClick} />
    </div>
  );
}
