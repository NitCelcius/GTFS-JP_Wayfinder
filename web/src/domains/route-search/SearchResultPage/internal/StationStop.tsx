import React from "react";

import { Station } from "../types";
import styles from "./StationStop.module.css";

interface StationStopProps {
  station: Station;
  isFirst: boolean;
  isLast: boolean;
  showTransferArrow: boolean;
  onStationClick?: (stationName: string) => void;
}

function PinIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <path
        d="M10 2C7.24 2 5 4.24 5 7c0 2.85 2.92 6.21 5 9 2.08-2.79 5-6.15 5-9 0-2.76-2.24-5-5-5zm0 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
        fill="currentColor"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="4" fill="currentColor" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <path
        d="M4 4v12M4 4l8 2-2 4 2 4-8-2V4z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 14l-7 7m0 0l-7-7m7 7V3"
      />
    </svg>
  );
}

export function StationStop({
  station,
  isFirst,
  isLast,
  showTransferArrow,
  onStationClick,
}: StationStopProps) {
  // Determine which icon to show based on position
  const getStationIcon = () => {
    if (isFirst) return <PinIcon />;
    if (isLast) return <FlagIcon />;
    return <LocationIcon />;
  };

  return (
    <div className={styles.container} data-name="StationStop">
      <div className={styles.stationRow}>
        <div className={styles.leftSection}>
          <div className={styles.stationIcon}>{getStationIcon()}</div>
          {onStationClick ? (
            <button
              className={styles.stationNameButton}
              onClick={() => onStationClick(station.stationName)}
              type="button"
            >
              {station.stationName}
            </button>
          ) : (
            <p className={styles.stationNameText}>{station.stationName}</p>
          )}
        </div>

        <div className={styles.rightSection}>
          {station.cost !== undefined && station.cost > 0 && (
            <p className={styles.costTextContent}>
              <span className={styles.costValue}>{station.cost}</span>
              <span className={styles.costCurrency}>円</span>
            </p>
          )}
          <div>
            {station.arrivalTime && (
              <p className={styles.timeTextContent}>
                <span className={styles.timeValue}>{station.arrivalTime}</span>
                <span className={styles.timeStatus}> 着</span>
              </p>
            )}
            {station.departureTime && (
              <p className={styles.timeTextContent}>
                <span className={styles.timeValue}>
                  {station.departureTime}
                </span>
                <span className={styles.timeStatus}> 発</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {showTransferArrow && (
        <div className={styles.transferArrow}>
          <ArrowDownIcon />
        </div>
      )}
    </div>
  );
}
