import { useEffect, useRef, useState } from "react";

import type { StopIdAndName } from "@/api/types.gen";
import { ArrowRightIcon, LocationPinIcon } from "@/components/icons";
import { apiClient, getCurrentApiBaseUrl } from "@/lib/api";
import type { BusStopSearchResult } from "@/types";

import styles from "./BusStopSearchModal.module.css";

interface BusStopSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBusStop: (result: BusStopSearchResult) => void;
  title?: string;
  placeholder?: string;
}

export function BusStopSearchModal({
  isOpen,
  onClose,
  onSelectBusStop,
  title = "バス停を検索",
  placeholder = "バス停名を入力してください",
}: BusStopSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StopIdAndName[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Spinner keyframes now defined in CSS module; runtime injection removed.

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

  // Handle search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Making API request with baseUrl:", getCurrentApiBaseUrl());
        const response = await apiClient.searchBusStops(
          searchQuery.trim(),
          false
        );

        if (response.data) {
          setSearchResults(response.data.stop_ids);
        }
      } catch (err) {
        console.error("Failed to search bus stops:", err);
        setError("バス停の検索に失敗しました。もう一度お試しください。");
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectBusStop = (selectedStop: StopIdAndName) => {
    // Group stops by name to create candidate list
    const stopsWithSameName = searchResults.filter(
      (stop) => stop.stop_name === selectedStop.stop_name
    );

    const result: BusStopSearchResult = {
      stop_name: selectedStop.stop_name,
      candidate_stop_id_list: stopsWithSameName.map((stop) => stop.stop_id),
    };

    onSelectBusStop(result);
    onClose();
  };

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
            onClick={onClose}
            aria-label="閉じる"
          >
            <img
              src="/icons/close.svg"
              alt=""
              className="w-8 h-8"
              aria-hidden="true"
            />
          </button>
        </div>

        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              <img
                src="/icons/alert-triangle.svg"
                alt=""
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
                  <img
                    src="/icons/search.svg"
                    alt=""
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
                  <img
                    src="/icons/location-pin.svg"
                    alt=""
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
