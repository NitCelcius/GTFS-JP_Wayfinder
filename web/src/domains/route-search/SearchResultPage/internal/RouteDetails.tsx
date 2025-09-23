import { RouteOption } from "../types";
import { StationStop } from "./StationStop";
import styles from "./RouteDetails.module.css";

interface RouteDetailsProps {
  route: RouteOption;
}

export function RouteDetails({ route }: RouteDetailsProps) {
  return (
    <div className={styles.container} data-name="RouteDetails">
      <div className={styles.stationsList}>
        {route.stations.map((station, index) => (
          <StationStop
            key={`${station.stationName}-${index}`}
            station={station}
            isFirst={index === 0}
            isLast={index === route.stations.length - 1}
            showTransferArrow={index < route.stations.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
