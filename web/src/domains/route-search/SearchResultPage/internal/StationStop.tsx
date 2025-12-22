import React from "react";

import { Icon } from "@/components/common";

import { Station } from "../types";
import styles from "./StationStop.module.css";

interface StationStopProps {
  station: Station;
  isFirst: boolean;
  isLast: boolean;
  showTransferArrow: boolean;
}

function PinIcon() {
  return <Icon name="location-pin-simple" size={24} aria-hidden="true" />;
}

function LocationIcon() {
  return <Icon name="location-dot" size={24} aria-hidden="true" />;
}

function FlagIcon() {
  return <Icon name="flag-simple" size={24} aria-hidden="true" />;
}

function ArrowDownIcon() {
  return <Icon name="arrow-down-long" size={24} aria-hidden="true" />;
}

export function StationStop({
  station,
  isFirst,
  isLast,
  showTransferArrow,
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
          <p className={styles.stationNameText}>{station.stationName}</p>
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
