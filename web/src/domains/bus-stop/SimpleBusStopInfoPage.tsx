import React from "react";

import styles from "./SimpleBusStopInfoPage.module.css";

interface NextBusInfo {
  line: string;
  destination: string;
  arrivalTime: string;
  minutesUntil?: number;
}

interface RouteStop {
  name: string;
  time?: string;
  isCurrent?: boolean;
}

interface SimpleBusStopInfoPageProps {
  busStopName: string;
  distance?: string;
  nextBus?: NextBusInfo;
  upcomingBuses?: NextBusInfo[];
  routeStops?: RouteStop[];
  onBack?: () => void;
}

export function SimpleBusStopInfoPage({
  busStopName,
  distance,
  nextBus,
  upcomingBuses = [],
  routeStops = [],
  onBack,
}: SimpleBusStopInfoPageProps) {
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
          <div className={styles.busStopInfo}>
            <div className={styles.icon}>🚏</div>
            <div>
              <h1 className={styles.busStopName}>{busStopName}</h1>
              {distance && <p className={styles.distance}>{distance}</p>}
            </div>
          </div>
        </div>

        {/* Next Bus Section */}
        {nextBus ? (
          <div className={styles.nextBusCard}>
            <h2 className={styles.sectionTitle}>次のバス</h2>
            <div className={styles.nextBusContent}>
              <div className={styles.busLine}>
                <span className={styles.lineLabel}>路線</span>
                <span className={styles.lineValue}>{nextBus.line}</span>
              </div>
              <div className={styles.destination}>
                <span className={styles.destinationLabel}>行き先</span>
                <span className={styles.destinationValue}>
                  {nextBus.destination}
                </span>
              </div>
              <div className={styles.arrivalTime}>
                <span className={styles.timeLabel}>到着時刻</span>
                <span className={styles.timeValue}>{nextBus.arrivalTime}</span>
              </div>
              {nextBus.minutesUntil !== undefined && (
                <div className={styles.countdown}>
                  <span className={styles.countdownValue}>
                    あと {nextBus.minutesUntil} 分
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.noBusCard}>
            <p className={styles.noBusText}>現在運行中のバスはありません</p>
          </div>
        )}

        {/* Upcoming Buses */}
        {upcomingBuses.length > 0 && (
          <div className={styles.upcomingSection}>
            <h2 className={styles.sectionTitle}>次の時刻表</h2>
            <div className={styles.upcomingList}>
              {upcomingBuses.map((bus, index) => (
                <div key={index} className={styles.upcomingItem}>
                  <div className={styles.upcomingTime}>{bus.arrivalTime}</div>
                  <div className={styles.upcomingDetails}>
                    <div className={styles.upcomingLine}>{bus.line}</div>
                    <div className={styles.upcomingDestination}>
                      {bus.destination}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Route Preview */}
        {routeStops.length > 0 && (
          <div className={styles.routeSection}>
            <h2 className={styles.sectionTitle}>バスの経路</h2>
            <div className={styles.routeList}>
              {routeStops.map((stop, index) => (
                <div
                  key={index}
                  className={`${styles.routeStop} ${stop.isCurrent ? styles.currentStop : ""}`}
                >
                  <div className={styles.routeDot}>
                    {stop.isCurrent && <div className={styles.currentDot} />}
                  </div>
                  <div className={styles.stopDetails}>
                    <div className={styles.stopName}>
                      {stop.name}
                      {stop.isCurrent && (
                        <span className={styles.currentLabel}> (現在地)</span>
                      )}
                    </div>
                    {stop.time && (
                      <div className={styles.stopTime}>{stop.time}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
