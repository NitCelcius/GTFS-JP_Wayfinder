import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  onBack: () => void;
}

export function EmptyState({ onBack }: EmptyStateProps) {
  return (
    <div className={styles.fullScreenCenter}>
      <div className={styles.center}>
        <div className={styles.message}>検索結果がありません</div>
        <button onClick={onBack} className={styles.button}>
          検索に戻る
        </button>
      </div>
    </div>
  );
}
