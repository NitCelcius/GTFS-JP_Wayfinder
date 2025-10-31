import React from "react";

import styles from "./JourneyTimeline.module.css";

interface JourneyStop {
  id?: string;
  name: string;
  time?: string;
  arrivalTime?: string;
  departureTime?: string;
  arrivalDatetime: Date;
  departureDatetime: Date;
  cost?: number;
  type?: "origin" | "intermediate" | "destination" | "current";
  label?: string;
  isActive?: boolean;
}

interface JourneyTimelineProps {
  stops: JourneyStop[];
  title?: string;
  renderRightContent?: (stop: JourneyStop) => React.ReactNode; // Optional custom render function for right section
}

// Styles migrated to JourneyTimeline.module.css

function LocationIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 2H21l-3 6 3 6h-8.5l-1-2H5a2 2 0 00-2 2zm9-13.5V9"
      />
    </svg>
  );
}

function CircleIcon() {
  return <div className={styles.circleIcon}></div>;
}

export function JourneyTimeline({
  stops,
  title,
  renderRightContent,
}: JourneyTimelineProps) {
  const getStopIcon = (stop: JourneyStop) => {
    if (stop.type === "current" || stop.type === "origin") {
      return <LocationIcon />;
    } else if (stop.type === "destination") {
      return <FlagIcon />;
    } else {
      return <CircleIcon />;
    }
  };

  return (
    <div className={styles.container}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.scrollContainer}>
        <div className={styles.journey}>
          {stops.length > 1 && <div className={styles.fullConnector}></div>}
          {stops.map((stop, index) => (
            <div key={stop.id || index} className={styles.stopContainer}>
              <div className={styles.leftSection}>
                <div className={styles.icon}>{getStopIcon(stop)}</div>
                <div className={styles.stopInfo}>
                  <span className={styles.stopName}>{stop.name}</span>
                  {stop.label && (
                    <span className={styles.stopLabel}>{stop.label}</span>
                  )}
                </div>
              </div>
              <div className={styles.rightSection}>
                {renderRightContent && renderRightContent(stop)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
