import { BusStopItem } from "./BusStopItem";
import styles from "./BusStopList.module.css";

export interface BusStop {
  id: string;
  name: string;
  distance: string;
}

interface BusStopListProps {
  busStops: BusStop[];
  showHeader?: boolean;
  headerText?: string;
  onBusStopSelect?: (busStopId: string) => void;
}

export function BusStopList({
  busStops,
  showHeader = false,
  headerText = "検索結果",
  onBusStopSelect,
}: BusStopListProps) {
  return (
    <div className={styles.container}>
      {showHeader && (
        <div className={styles.header}>
          <h3 className={styles.headerText}>{headerText}</h3>
        </div>
      )}

      <div className={styles.list}>
        {busStops.map((busStop) => (
          <BusStopItem
            key={busStop.id}
            busStop={busStop}
            onSelect={onBusStopSelect}
          />
        ))}
      </div>
    </div>
  );
}
