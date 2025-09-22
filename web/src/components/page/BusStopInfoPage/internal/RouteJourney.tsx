interface RouteStop {
  id: string;
  name: string;
  type: "current" | "intermediate" | "destination";
  time: string;
  cost?: number;
  label?: string;
}

interface RouteJourneyProps {
  title: string;
  stops: RouteStop[];
}

import styles from "./RouteJourney.module.css";

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

export function RouteJourney({ title, stops }: RouteJourneyProps) {
  const getStopIcon = (stop: RouteStop, index: number) => {
    if (stop.type === "current") {
      return <LocationIcon />;
    } else if (stop.type === "destination") {
      return <FlagIcon />;
    } else {
      return <CircleIcon />;
    }
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
            ></div>
          )}

          {stops.map((stop, _index) => (
            <div key={stop.id} className={styles.stopContainer}>
              <div className={styles.leftSection}>
                <div className={styles.icon}>{getStopIcon(stop, _index)}</div>
                <div className={styles.stopInfo}>
                  <span className={styles.stopName}>{stop.name}</span>
                  {stop.label && (
                    <span className={styles.stopLabel}>{stop.label}</span>
                  )}
                </div>
              </div>

              <div className={styles.rightSection}>
                {stop.cost !== undefined && (
                  <span className="flex items-baseline gap-1">
                    <span className={styles.costValue}>{stop.cost}</span>
                    <span className={styles.costCurrency}>円</span>
                  </span>
                )}
                <span className={styles.timeValue}>{stop.time}</span>
                <span className={styles.status}>着</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
