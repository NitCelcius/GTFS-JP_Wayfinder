import Link from "next/link";

import styles from "./ErrorBoundary.module.css";

interface ErrorBoundaryProps {
  message?: string;
  onReset?: () => void;
}

/**
 * Common error container component for displaying error messages.
 * Shows a standard "エラーが発生しました" message with optional details
 * and a link to return to the home page.
 */
export function ErrorBoundary({ message, onReset }: ErrorBoundaryProps) {
  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <h2 className={styles.title}>エラーが発生しました</h2>
        {message && <p className={styles.message}>{message}</p>}
        <div className={styles.buttonRow}>
          {onReset && (
            <button onClick={onReset} className={styles.resetButton}>
              再試行
            </button>
          )}
          <Link href="/" className={styles.homeButton}>
            ホームへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
