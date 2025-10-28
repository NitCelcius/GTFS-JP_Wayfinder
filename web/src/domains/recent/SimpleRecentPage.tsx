import styles from "./SimpleRecentPage.module.css";

interface RecentBusStop {
  id: string;
  name: string;
  distance: string;
  searchedAt: string;
}

interface RecentRoute {
  id: string;
  fromStation: string;
  toStation: string;
  searchedAt: string;
}

interface SimpleRecentPageProps {
  recentBusStops?: RecentBusStop[];
  recentRoutes?: RecentRoute[];
  onBusStopSelect?: (id: string) => void;
  onRouteSelect?: (fromStation: string, toStation: string) => void;
  onBack?: () => void;
}

export function SimpleRecentPage({
  recentBusStops = [],
  recentRoutes = [],
  onBusStopSelect,
  onRouteSelect,
  onBack,
}: SimpleRecentPageProps) {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          {onBack && (
            <button className={styles.backButton} onClick={onBack}>
              ← 戻る
            </button>
          )}
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>🕒</span>
            検索履歴
          </h1>
          <p className={styles.subtitle}>最近検索したバス停と経路</p>
        </div>

        {/* Recent Bus Stops Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🚏</span>
            バス停の履歴
          </h2>
          {recentBusStops.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>バス停の検索履歴はありません</p>
            </div>
          ) : (
            <div className={styles.itemList}>
              {recentBusStops.map((busStop) => (
                <button
                  key={busStop.id}
                  className={styles.busStopCard}
                  onClick={() => onBusStopSelect?.(busStop.id)}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>{busStop.name}</div>
                    <div className={styles.cardTime}>{busStop.searchedAt}</div>
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.distanceBadge}>
                      {busStop.distance}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Recent Routes Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🗺️</span>
            経路検索の履歴
          </h2>
          {recentRoutes.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>経路検索の履歴はありません</p>
            </div>
          ) : (
            <div className={styles.itemList}>
              {recentRoutes.map((route) => (
                <button
                  key={route.id}
                  className={styles.routeCard}
                  onClick={() =>
                    onRouteSelect?.(route.fromStation, route.toStation)
                  }
                >
                  <div className={styles.routeHeader}>
                    <div className={styles.routeStations}>
                      <div className={styles.fromStation}>
                        <span className={styles.stationLabel}>出発</span>
                        <span className={styles.stationName}>
                          {route.fromStation}
                        </span>
                      </div>
                      <div className={styles.routeArrow}>→</div>
                      <div className={styles.toStation}>
                        <span className={styles.stationLabel}>到着</span>
                        <span className={styles.stationName}>
                          {route.toStation}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardTime}>{route.searchedAt}</div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Help Text */}
        <div className={styles.helpText}>
          <p>履歴をタップすると、再度検索できます</p>
        </div>
      </div>
    </div>
  );
}
