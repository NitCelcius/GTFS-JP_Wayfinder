import { useEffect } from "react";

import type { StopIdAndName } from "@/api/types.gen";
import { Icon } from "@/components/common";
import { ArrowRightIcon, LocationPinIcon } from "@/components/icons";
import type { BusStopSearchResult } from "@/types";

import styles from "./BusStopSearchModal.module.css";

export interface BusStopSearchModalProps {
  isOpen: boolean;
  onCanceled: () => void;
  onSelected: (result: BusStopSearchResult) => void;
  title?: string;
  placeholder?: string;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchResults: StopIdAndName[];
  isLoading: boolean;
  error: string | null;
}

export function BusStopSearchModal({
  isOpen,
  onCanceled,
  onSelected,
  title = "バス停を検索",
  placeholder = "バス停名を入力してください",
  searchQuery,
  onSearchQueryChange,
  searchResults,
  isLoading,
  error,
}: BusStopSearchModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSelectBusStop = (selectedStop: StopIdAndName) => {
    // Group stops by name to create candidate list
    const stopsWithSameName = searchResults.filter(
      (stop) => stop.stop_name === selectedStop.stop_name
    );

    const result: BusStopSearchResult = {
      stop_name: selectedStop.stop_name,
      candidate_stop_id_list: stopsWithSameName.map((stop) => stop.stop_id),
    };

    onSelected(result);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCanceled();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCanceled();
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.modal} onClick={handleModalClick}>
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            {title}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onCanceled}
            aria-label="閉じる"
          >
            <Icon name="close" size={32} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.resultsContainer}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <div>
                <div className={styles.spinner} />
                <div className={styles.resultText}>検索中...</div>
              </div>
            </div>
          ) : error ? (
            <div className={styles.emptyState}>
              <Icon
                name="alert-triangle"
                size={48}
                className={styles.emptyIcon}
                aria-hidden="true"
              />
              <div className={styles.emptyTitle}>エラーが発生しました</div>
              <div className={styles.emptyDescription}>{error}</div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className={styles.emptyState}>
              {searchQuery.trim() ? (
                <>
                  <Icon
                    name="search"
                    size={48}
                    className={styles.emptyIcon}
                    aria-hidden="true"
                  />
                  <div className={styles.emptyTitle}>
                    該当するバス停が見つかりませんでした
                  </div>
                  <div className={styles.emptyDescription}>
                    別のキーワードで検索してみてください
                  </div>
                </>
              ) : (
                <>
                  <Icon
                    name="location-pin"
                    size={48}
                    className={styles.emptyIcon}
                    aria-hidden="true"
                  />
                  <div className={styles.emptyTitle}>バス停を検索</div>
                  <div className={styles.emptyDescription}>
                    上の検索ボックスにバス停名を入力してください
                  </div>
                </>
              )}
            </div>
          ) : (
            searchResults.map((stop) => (
              <div
                key={stop.stop_id}
                className={styles.resultItem}
                onClick={() => handleSelectBusStop(stop)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelectBusStop(stop);
                  }
                }}
              >
                <div className={styles.resultRow}>
                  <div className={styles.iconContainer}>
                    <LocationPinIcon
                      size={40}
                      color="var(--color-action-primary)"
                    />
                  </div>
                  <div className={styles.resultMain}>
                    <div className={styles.resultText}>{stop.stop_name}</div>
                    <div className={styles.resultSubtext}>
                      バス停ID: {stop.stop_id}
                    </div>
                  </div>
                </div>
                <button className={styles.actionButton} aria-label="選択">
                  <ArrowRightIcon className={styles.arrowIcon} size={32} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
