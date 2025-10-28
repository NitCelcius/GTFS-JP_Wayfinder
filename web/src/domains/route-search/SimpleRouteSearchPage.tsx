import { useState } from "react";

import { BusStopSearchModal } from "@/components/common/BusStopSearchModal/BusStopSearchModal";
import type { BusStopSearchResult } from "@/types";

import styles from "./SimpleRouteSearchPage.module.css";

interface SimpleRouteSearchPageProps {
  onSearch?: (searchParams: {
    originStopId: string;
    destinationStopId: string;
    originStopName: string;
    destinationStopName: string;
    beginTime: string;
  }) => void;
}

export function SimpleRouteSearchPage({
  onSearch,
}: SimpleRouteSearchPageProps) {
  const [originValue, setOriginValue] = useState("");
  const [destinationValue, setDestinationValue] = useState("");
  const [originCandidateStopIds, setOriginCandidateStopIds] = useState<
    string[]
  >([]);
  const [destinationCandidateStopIds, setDestinationCandidateStopIds] =
    useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<
    "origin" | "destination" | null
  >(null);

  const handleOriginStopSelect = (result: BusStopSearchResult) => {
    setOriginValue(result.stop_name);
    setOriginCandidateStopIds(result.candidate_stop_id_list);
    setActiveModal(null);
  };

  const handleDestinationStopSelect = (result: BusStopSearchResult) => {
    setDestinationValue(result.stop_name);
    setDestinationCandidateStopIds(result.candidate_stop_id_list);
    setActiveModal(null);
  };

  const handleSearch = () => {
    const originStopId = originCandidateStopIds[0];
    const destinationStopId = destinationCandidateStopIds[0];

    if (!originStopId || !destinationStopId) {
      return;
    }

    const now = new Date();
    const beginTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    onSearch?.({
      originStopId,
      destinationStopId,
      originStopName: originValue,
      destinationStopName: destinationValue,
      beginTime,
    });
  };

  const isSearchEnabled = originValue.trim() && destinationValue.trim();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>バス経路検索</h1>
        <p className={styles.subtitle}>
          出発地と目的地を選んで、最適なバス経路を見つけましょう
        </p>

        <div className={styles.inputSection}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>🚏</span>
              <span>乗車するバス停</span>
            </label>
            <button
              className={styles.inputButton}
              onClick={() => setActiveModal("origin")}
            >
              {originValue || "バス停を選択してください"}
            </button>
          </div>

          <div className={styles.arrow}>↓</div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>🎯</span>
              <span>降車するバス停</span>
            </label>
            <button
              className={styles.inputButton}
              onClick={() => setActiveModal("destination")}
            >
              {destinationValue || "バス停を選択してください"}
            </button>
          </div>
        </div>

        <button
          className={styles.searchButton}
          onClick={handleSearch}
          disabled={!isSearchEnabled}
        >
          {isSearchEnabled ? "経路を検索" : "バス停を選択してください"}
        </button>

        {originValue && destinationValue && (
          <div className={styles.summary}>
            <p className={styles.summaryText}>
              <strong>{originValue}</strong> から{" "}
              <strong>{destinationValue}</strong> への経路を検索します
            </p>
          </div>
        )}
      </div>

      {activeModal === "origin" && (
        <BusStopSearchModal
          onClose={() => setActiveModal(null)}
          onStopSelect={handleOriginStopSelect}
          title="乗車バス停を選択"
        />
      )}

      {activeModal === "destination" && (
        <BusStopSearchModal
          onClose={() => setActiveModal(null)}
          onStopSelect={handleDestinationStopSelect}
          title="降車バス停を選択"
        />
      )}
    </div>
  );
}
