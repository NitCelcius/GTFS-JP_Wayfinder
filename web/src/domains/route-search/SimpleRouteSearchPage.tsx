import React, { useState } from "react";

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

  const handleSearch = () => {
    // For demo purposes, use placeholder IDs
    const originStopId = "origin-1";
    const destinationStopId = "dest-1";

    const now = new Date();
    const beginTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

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
            <input
              type="text"
              className={styles.inputButton}
              placeholder="バス停名を入力してください"
              value={originValue}
              onChange={(e) => setOriginValue(e.target.value)}
            />
          </div>

          <div className={styles.arrow}>↓</div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>🎯</span>
              <span>降車するバス停</span>
            </label>
            <input
              type="text"
              className={styles.inputButton}
              placeholder="バス停名を入力してください"
              value={destinationValue}
              onChange={(e) => setDestinationValue(e.target.value)}
            />
          </div>
        </div>

        <button
          className={styles.searchButton}
          onClick={handleSearch}
          disabled={!isSearchEnabled}
        >
          {isSearchEnabled ? "経路を検索" : "バス停を入力してください"}
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
    </div>
  );
}
