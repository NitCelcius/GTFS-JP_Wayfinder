import styles from "./ErrorState.module.css";

interface ErrorStateProps {
  error: string;
  onBack: () => void;
}

export function ErrorState({ error, onBack }: ErrorStateProps) {
  return (
    <div className={styles.fullScreenCenter}>
      <div className={styles.center}>
        <div className={styles.error}>エラー: {error}</div>
        <button onClick={onBack} className={styles.button}>
          検索に戻る
        </button>
      </div>
    </div>
  );
}
