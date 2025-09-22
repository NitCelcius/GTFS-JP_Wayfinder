import styles from "./JourneyTimeline.module.css";

interface JourneyStop {
  id: string;
  name: string;
  type: "origin" | "intermediate" | "destination" | "current";
  time?: string;
  arrivalTime?: string;
  departureTime?: string;
  cost?: number;
  label?: string;
}

interface JourneyTimelineProps {
  title: string;
  stops: JourneyStop[];
  variant?: "bus-info" | "search-result";
  showCosts?: boolean;
}

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
  return <div className="w-3 h-3 rounded-full bg-gray-400" />;
}

export function JourneyTimeline({
  title,
  stops,
  variant = "bus-info",
  showCosts = true,
}: JourneyTimelineProps) {
  const getStopIcon = (stop: JourneyStop) => {
    if (stop.type === "current" || stop.type === "origin")
      return <LocationIcon />;
    if (stop.type === "destination") return <FlagIcon />;
    return <CircleIcon />;
  };

  const renderTimeInfo = (stop: JourneyStop) => {
    if (variant === "search-result") {
      return (
        <div className={styles.timesContainer}>
          {stop.arrivalTime && (
            <span className={styles.timeText}>{stop.arrivalTime} 着</span>
          )}
          {stop.departureTime && (
            <span className={styles.timeText}>{stop.departureTime} 発</span>
          )}
        </div>
      );
    }

    // bus-info variant
    return (
      <>
        <span className={styles.timeValue}>{stop.time}</span>
        <span className={styles.status}>着</span>
      </>
    );
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>

      <div className={styles.scrollContainer}>
        <div className={styles.journey}>
          {/* Single continuous line for all stops */}
          {stops.length > 1 && (
            <div
              className={styles.fullConnector}
              style={{
                top: `${(100 / stops.length) * 0.5}%`,
                bottom: `${(100 / stops.length) * 0.5}%`,
              }}
            />
          )}

          {stops.map((stop, _index) => (
            <div key={stop.id} className={styles.stopContainer}>
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
                {showCosts && stop.cost !== undefined && stop.cost > 0 && (
                  <div className={styles.costContainer}>
                    <span className="flex items-baseline gap-1">
                      <span className={styles.costValue}>{stop.cost}</span>
                      <span className={styles.costCurrency}>円</span>
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
