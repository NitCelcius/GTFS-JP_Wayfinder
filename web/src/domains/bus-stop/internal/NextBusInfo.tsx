import styles from "./NextBusInfo.module.css";

interface BusInfo {
  line: string;
  system: string;
  destination: string;
  direction: string;
  arrivalTime: string;
  status: string;
}

interface NextBusInfoProps {
  busInfo: BusInfo;
  showPreviousIndicator?: boolean;
  showNextIndicator?: boolean;
}

export function NextBusInfo({
  busInfo,
  showPreviousIndicator = true,
  showNextIndicator = true,
}: NextBusInfoProps) {
  const handlePreviousBus = () => {
    // Placeholder for previous bus functionality
    console.log("Show previous bus");
  };

  const handleNextBus = () => {
    // Placeholder for next bus functionality
    console.log("Show next bus");
  };

  return (
    <div className={styles.wrapper}>
      {/* Left indicator for previous bus */}
      {showPreviousIndicator && (
        <div className={`${styles.indicator} ${styles.leftIndicator}`}></div>
      )}

      {/* Right indicator for next bus */}
      {showNextIndicator && (
        <div className={`${styles.indicator} ${styles.rightIndicator}`}></div>
      )}

      <div className={styles.container}>
        <h3 className={styles.header}>次のバス</h3>

        <div className={styles.busLine}>
          {busInfo.line} {busInfo.system}
        </div>

        <div className={styles.mainInfo}>
          <span className={styles.mainInfoText}>{busInfo.destination}</span>{" "}
          <span className={styles.directionText}>{busInfo.direction}</span>{" "}
          <span className={styles.mainInfoText}>{busInfo.arrivalTime}</span>{" "}
          <span className={styles.statusText}>{busInfo.status}</span>
        </div>

        <div className={styles.navigation}>
          <button
            className={styles.navButtonDisabled}
            onClick={handlePreviousBus}
          >
            ← 前のバス
          </button>
          {/* TODO: implement navButton feature, but now it's disabled */}
          <button className={styles.navButtonDisabled} onClick={handleNextBus}>
            次のバス →
          </button>
        </div>
      </div>
    </div>
  );
}
