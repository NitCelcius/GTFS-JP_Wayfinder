import styles from "./LoadingState.module.css";

export function LoadingState() {
  return (
    <div className={styles.fullScreenCenter}>
      <div className={styles.center}>
        <div className={styles.spinner}></div>
        <div className={styles.message}>🚌 経路を検索しています...</div>
        <div className={styles.searchDesc}>リアルタイムバス情報を取得中</div>
      </div>
    </div>
  );
}
