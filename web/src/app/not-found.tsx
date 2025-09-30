import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>ページが見つかりません</h1>
      <p className={styles.message}>
        指定されたページは存在しないか、移動されました。
      </p>
    </div>
  );
}
