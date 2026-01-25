"use client";

import { X } from "lucide-react";

import styles from "./PlatformSwitchModal.module.css";

/**
 * Represents a platform (bus stop with same name but different platform_code)
 */
export interface PlatformInfo {
  stopId: string;
  stopName: string;
  platformCode: string | null;
  lat: number;
  lon: number;
}

interface PlatformSwitchModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when the modal is closed */
  onClose: () => void;
  /** Callback when a platform is selected */
  onPlatformSelect: (platform: PlatformInfo) => void;
  /** The current stop_id (to highlight the current selection) */
  currentStopId?: string;
  /** List of available platforms (must have at least one entry with a valid stopName) */
  platforms: PlatformInfo[];
  /** Whether the data is loading */
  isLoading?: boolean;
  /** Error message if loading failed */
  error?: string | null;
}

function CloseIcon() {
  return <X size={24} aria-hidden="true" />;
}

export function PlatformSwitchModal({
  isOpen,
  onClose,
  onPlatformSelect,
  currentStopId,
  platforms,
  isLoading = false,
  error = null,
}: PlatformSwitchModalProps) {
  if (!isOpen) return null;

  const handlePlatformClick = (platform: PlatformInfo) => {
    if (platform.stopId !== currentStopId) {
      onPlatformSelect(platform);
    }
    onClose();
  };

  // Get the stop name from the first platform.
  // All platforms in the list share the same name (they're related by stop name).
  // If no platforms are available yet (loading state), we won't display the name section anyway.
  const stopName = platforms.length > 0 ? platforms[0].stopName : "";

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>のりば切替</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="閉じる"
          >
            <CloseIcon />
          </button>
        </div>

        <div className={styles.modalBody}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <p>読み込み中...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p className={styles.errorText}>{error}</p>
            </div>
          ) : platforms.length <= 1 ? (
            <div className={styles.emptyContainer}>
              <p>この停留所には他ののりばがありません</p>
            </div>
          ) : (
            <>
              <p className={styles.stopName}>{stopName}</p>
              <ul className={styles.platformList}>
                {platforms.map((platform) => {
                  const isCurrent = platform.stopId === currentStopId;
                  return (
                    <li key={platform.stopId}>
                      <button
                        className={`${styles.platformItem} ${isCurrent ? styles.currentPlatform : ""}`}
                        onClick={() => handlePlatformClick(platform)}
                        disabled={isCurrent}
                        aria-current={isCurrent ? "true" : undefined}
                      >
                        <span className={styles.platformCode}>
                          {platform.platformCode
                            ? `${platform.platformCode}番のりば`
                            : "のりば未設定"}
                        </span>
                        {isCurrent && (
                          <span className={styles.currentLabel}>現在地</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
