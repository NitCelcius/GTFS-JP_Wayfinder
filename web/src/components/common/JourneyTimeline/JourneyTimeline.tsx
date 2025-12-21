import React from "react";

// Styles migrated to JourneyTimeline.module.css

import { Icon } from "@/components/common/Icon/Icon";

import styles from "./JourneyTimeline.module.css";

interface JourneyStop {
  id?: string;
  name: string;
  time?: string;
  arrivalTime?: string;
  departureTime?: string;
  arrivalDatetime?: Date;
  departureDatetime?: Date;
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

function LocationIcon() {
  return <Icon name="location-pin" className="w-6 h-6" aria-hidden="true" />;
}

function FlagIcon() {
  return <Icon name="flag" className="w-6 h-6" aria-hidden="true" />;
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
