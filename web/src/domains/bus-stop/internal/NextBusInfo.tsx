import React from "react";

import { useTimeDisplay } from "@/hooks";

import type { BusInfo } from "../types";
import styles from "./NextBusInfo.module.css";

interface NextBusInfoProps {
  busInfo: BusInfo;
  canShowPrevious?: boolean;
  canShowNext?: boolean;
  onPreviousBus?: () => void;
  onNextBus?: () => void;
}

export function NextBusInfo({
  busInfo,
  canShowPrevious = false,
  canShowNext = false,
  onPreviousBus,
  onNextBus,
}: NextBusInfoProps) {
  const timeDisplay = useTimeDisplay();

  const handlePreviousBus = () => {
    onPreviousBus?.();
  };

  const handleNextBus = () => {
    onNextBus?.();
  };

  return (
    <div className={styles.wrapper}>
      {/* Left indicator for previous bus */}
      {canShowPrevious && (
        <div className={`${styles.indicator} ${styles.leftIndicator}`}></div>
      )}

      {/* Right indicator for next bus */}
      {canShowNext && (
        <div className={`${styles.indicator} ${styles.rightIndicator}`}></div>
      )}

      <div className={styles.container}>
        <h3 className={styles.header}>次のバス</h3>

        <div className={styles.busLine}>
          {busInfo.line} {busInfo.system}
        </div>

        <div className={styles.mainInfo}>
          <div className="line-clamp-3">
            <span className={styles.mainInfoText}>{busInfo.destination}</span>{" "}
            <span className={styles.directionText}>{busInfo.direction}</span>
          </div>
          <div>
            <span className={styles.mainInfoText}>
              {busInfo.arrivalDatetime
                ? timeDisplay.format(
                    busInfo.arrivalDatetime,
                    busInfo.arrivalTime
                  )
                : busInfo.arrivalTime}
            </span>{" "}
            <span className={styles.statusText}>{busInfo.status}</span>
          </div>
        </div>

        <div className={styles.navigation}>
          <button
            className={
              canShowPrevious ? styles.navButton : styles.navButtonDisabled
            }
            onClick={handlePreviousBus}
            disabled={!canShowPrevious}
          >
            ← 前のバス
          </button>
          <button
            className={
              canShowNext ? styles.navButton : styles.navButtonDisabled
            }
            onClick={handleNextBus}
            disabled={!canShowNext}
          >
            次のバス →
          </button>
        </div>
      </div>
    </div>
  );
}
