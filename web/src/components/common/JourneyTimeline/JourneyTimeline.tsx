import React from "react";

interface JourneyStop {
  id?: string;
  name: string;
  time?: string;
  arrivalTime?: string;
  departureTime?: string;
  cost?: number;
  type?: "origin" | "intermediate" | "destination" | "current";
  label?: string;
  isActive?: boolean;
}

interface JourneyTimelineProps {
  stops: JourneyStop[];
  title?: string;
  variant?: string;
  showCosts?: boolean;
}

const STYLES = {
  container: "w-full h-full flex flex-col bg-white p-[var(--size-spacing-lg)]",
  title: "text-[0.875rem] mb-[var(--size-spacing-sm)]",
  scrollContainer: "flex-1 overflow-y-auto",
  journey: "flex flex-col relative items-center",
  stopContainer:
    "flex relative py-[var(--size-spacing-lg)] w-full items-center",
  leftSection: "flex items-center gap-[var(--size-spacing-md)] flex-1",
  icon: "w-[1.5rem] h-[1.5rem] flex items-center justify-center relative z-20 bg-white rounded-full border border-gray-300 shadow-sm",
  stopInfo: "flex flex-col",
  stopName: "text-[1.25rem]",
  stopLabel: "text-[0.875rem] text-gray-600",
  rightSection:
    "flex flex-row items-end gap-[var(--size-spacing-sm)] self-center flex-1 flex-wrap justify-end",
  costContainer: "flex items-center justify-center",
  costValue: "text-[1.375rem]",
  costCurrency: "text-[0.875rem]",
  timeValue: "text-[1.375rem]",
  timesContainer: "flex flex-col items-end gap-[var(--size-spacing-xs)] flex-0",
  timeWrapper: "flex flex-0 whitespace-nowrap items-end",
  timeText: "text-[1rem] whitespace-nowrap",
  status: "text-[0.875rem]",
  fullConnector:
    "absolute left-[0.75rem] top-0 bottom-0 w-[2px] bg-gray-300 z-10",
} as const;

function LocationIcon() {
  return (
    <svg
      className="block size-full"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
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
    <svg
      className="block size-full"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 2H21l-3 6 3 6h-8.5l-1-2H5a2 2 0 00-2 2zm9-13.5V9"
      />
    </svg>
  );
}

function CircleIcon() {
  return <div className="w-3 h-3 rounded-full bg-gray-400"></div>;
}

export function JourneyTimeline({
  stops,
  title,
  variant = "bus-info",
  showCosts = true,
}: JourneyTimelineProps) {
  const getStopIcon = (stop: JourneyStop, index: number) => {
    if (stop.type === "current" || stop.type === "origin") {
      return <LocationIcon />;
    } else if (stop.type === "destination") {
      return <FlagIcon />;
    } else {
      return <CircleIcon />;
    }
  };

  const renderTimeInfo = (stop: JourneyStop) => {
    if (variant === "search-result") {
      return (
        <div className={STYLES.timesContainer}>
          {stop.arrivalTime && (
            <div className={STYLES.timeWrapper}>
              <span className={STYLES.timeText}>{stop.arrivalTime} 着</span>
            </div>
          )}
          {stop.departureTime && (
            <div className={STYLES.timeWrapper}>
              <span className={STYLES.timeText}>{stop.departureTime} 発</span>
            </div>
          )}
        </div>
      );
    } else {
      // bus-info variant
      return (
        <>
          <div className={STYLES.timeWrapper}>
            <span className={STYLES.timeValue}>{stop.time}</span>
            <span className={STYLES.status}>着</span>
          </div>
        </>
      );
    }
  };

  return (
    <div className={STYLES.container}>
      {title && <h3 className={STYLES.title}>{title}</h3>}

      <div className={STYLES.scrollContainer}>
        <div className={STYLES.journey}>
          {/* Continuous connector line spanning from first to last stop */}
          {stops.length > 1 && <div className={STYLES.fullConnector}></div>}

          {stops.map((stop, index) => (
            <div key={stop.id || index} className={STYLES.stopContainer}>
              <div className={STYLES.leftSection}>
                <div className={STYLES.icon}>{getStopIcon(stop, index)}</div>
                <div className={STYLES.stopInfo}>
                  <span className={STYLES.stopName}>{stop.name}</span>
                  {stop.label && (
                    <span className={STYLES.stopLabel}>{stop.label}</span>
                  )}
                </div>
              </div>

              <div className={STYLES.rightSection}>
                {showCosts && stop.cost !== undefined && stop.cost > 0 && (
                  <div className={STYLES.costContainer}>
                    <span className="flex items-baseline gap-1">
                      <span className={STYLES.costValue}>{stop.cost}</span>
                      <span className={STYLES.costCurrency}>円</span>
                    </span>
                  </div>
                )}
                {renderTimeInfo(stop)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
