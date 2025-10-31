"use client";

import { useEffect } from "react";

import styles from "./ErrorDialog.module.css";

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  error?: Error;
  contactEmail?: string;
}

export function ErrorDialog({
  isOpen,
  onClose,
  title = "エラーが発生しました",
  message = "申し訳ございません。予期しないエラーが発生しました。",
  error,
  contactEmail,
}: ErrorDialogProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleReportProblem = () => {
    const emailAddress = contactEmail || "support@example.com";
    const subject = encodeURIComponent("エラー報告");
    const body = encodeURIComponent(
      `エラーが発生しました\n\n` +
        `メッセージ: ${message}\n` +
        `${error ? `詳細: ${error.message}\n` : ""}` +
        `${error?.stack ? `スタックトレース:\n${error.stack}\n` : ""}` +
        `時刻: ${new Date().toISOString()}`
    );
    window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-dialog-title"
    >
      <div className={styles.dialog}>
        <div className={styles.header}>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="閉じる"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width={32}
              height={32}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {/* Error Icon */}
          <div className={styles.iconContainer}>
            <svg
              className={styles.errorIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 id="error-dialog-title" className={styles.title}>
            {title}
          </h2>

          {/* Message */}
          <p className={styles.message}>{message}</p>

          {/* Error details (for development) */}
          {error && process.env.NODE_ENV === "development" && (
            <div className={styles.errorDetails}>
              <details>
                <summary className={styles.errorSummary}>
                  エラーの詳細を表示
                </summary>
                <pre className={styles.errorStack}>
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.buttonRow}>
            <button onClick={handleReportProblem} className={styles.reportBtn}>
              この問題を報告する
            </button>
            <button onClick={handleGoHome} className={styles.homeBtn}>
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
