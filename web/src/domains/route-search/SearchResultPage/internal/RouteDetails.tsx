import { RouteOption } from "../types";
import styles from "./RouteDetails.module.css";
import { StationStop } from "./StationStop";

interface RouteDetailsProps {
  route: RouteOption;
  onStationClick?: (stationName: string) => void;
}

export function RouteDetails({ route, onStationClick }: RouteDetailsProps) {
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
            onStationClick={onStationClick}
          />
        ))}
      </div>
    </div>
  );
}
