import { Station } from "../types";
import styles from "./StationStop.module.css";

interface StationStopProps {
  station: Station;
  isFirst: boolean;
  isLast: boolean;
  showTransferArrow: boolean;
}

function PinIcon() {
  return (
    <svg className={styles.iconSvg} fill="none" viewBox="0 0 20 20">
      <path
        d="M10 2C7.24 2 5 4.24 5 7c0 2.85 2.92 6.21 5 9 2.08-2.79 5-6.15 5-9 0-2.76-2.24-5-5-5zm0 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
        fill="currentColor"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className={styles.iconSvg} fill="none" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="4" fill="currentColor" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg className={styles.iconSvg} fill="none" viewBox="0 0 20 20">
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
    <svg
      className={styles.iconSvg}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
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
          <div className={styles.stationName}>
            <p className={styles.stationNameText}>{station.stationName}</p>
          </div>
        </div>

        <div className={styles.rightSection}>
          {/* Cost container - on the left */}
          {station.cost !== undefined && station.cost > 0 && (
            <div className={styles.costContainer}>
              <div className={styles.costText}>
                <p className={styles.costTextContent}>{station.cost}円</p>
              </div>
            </div>
          )}

          {/* Times container - on the right, vertically stacked */}
          <div className={styles.timesContainer}>
            {station.arrivalTime && (
              <div className={styles.timeText}>
                <p className={styles.timeTextContent}>
                  {station.arrivalTime} 着
                </p>
              </div>
            )}
            {station.departureTime && (
              <div className={styles.timeText}>
                <p className={styles.timeTextContent}>
                  {station.departureTime} 発
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showTransferArrow && (
        <div className={styles.transferArrow}>
          <div className={styles.arrowIcon}>
            <ArrowDownIcon />
          </div>
        </div>
      )}
    </div>
  );
}
