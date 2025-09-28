import { useEffect, useRef, useState } from "react";

import type { StopIdAndName } from "@/api/types.gen";
import { apiClient, getCurrentApiBaseUrl } from "@/lib/api";
import type { BusStopSearchResult } from "@/types";

// Style constants with inline fallbacks to ensure all styling is applied
const STYLES = {
  overlay:
    "fixed inset-0 bg-black opacity-80 flex items-center justify-center z-50 p-4 transition-all duration-300 ease-out sm:p-8",
  modal:
    "bg-white rounded-2xl p-10 flex flex-col shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 ease-out scale-100 mx-auto",
  header: "flex items-center justify-between border-b border-gray-200 pb-8",
  title:
    "text-4xl font-semibold font-['Inter',_'Noto_Sans_JP',_sans-serif] text-gray-900",
  closeButton:
    "flex items-center justify-center w-12 h-12 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all duration-200",
  searchContainer: "py-8 border-b border-gray-100",
  searchInput:
    "w-full h-16 px-8 border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-xl",
  resultsContainer: "flex-1 overflow-y-auto space-y-6 py-8",
  resultItem:
    "flex items-center justify-between p-8 border border-gray-200 bg-white rounded-2xl cursor-pointer hover:bg-blue-50 hover:border-blue-200 hover:shadow-lg transition-all duration-200 shadow-sm",
  resultText:
    "text-2xl font-medium font-['Inter',_'Noto_Sans_JP',_sans-serif] text-gray-900",
  resultSubtext: "text-xl text-gray-500 mt-3",
  emptyState:
    "flex flex-col items-center justify-center p-20 text-gray-500 bg-white h-full",
  loadingState:
    "flex items-center justify-center p-20 text-gray-500 bg-white h-full",
  emptyIcon: "w-24 h-24 mb-8 text-gray-300",
  emptyTitle: "text-2xl font-medium text-gray-700 mb-6",
  emptyDescription: "text-xl text-gray-500 text-center leading-relaxed",
} as const;

// Inline style objects to ensure styling is applied even if Tailwind fails
const inlineStyles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    padding: "2rem",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "1rem",
    padding: "2.5rem",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    border: "1px solid #e5e7eb",
    maxHeight: "90vh",
    width: "95vw",
    maxWidth: "50rem",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
  },
  title: {
    fontSize: "2.25rem",
    fontWeight: "600",
    color: "#111827",
    margin: 0,
    fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
  },
  closeButton: {
    width: "3rem",
    height: "3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    color: "#9ca3af",
    fontSize: "1.5rem",
  },
  searchInput: {
    width: "100%",
    height: "4rem",
    padding: "0 2rem",
    border: "2px solid #d1d5db",
    borderRadius: "0.75rem",
    fontSize: "1.25rem",
    color: "#111827",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  resultItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "2rem",
    border: "1px solid #e5e7eb",
    borderRadius: "1rem",
    backgroundColor: "white",
    cursor: "pointer",
    marginBottom: "1.5rem",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease",
  },
  resultText: {
    fontSize: "1.5rem",
    fontWeight: "500",
    color: "#111827",
    margin: 0,
    fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
  },
  resultSubtext: {
    fontSize: "1.25rem",
    color: "#6b7280",
    marginTop: "0.75rem",
    margin: "0.75rem 0 0 0",
  },
  iconContainer: {
    width: "5rem",
    height: "5rem",
    backgroundColor: "#dbeafe",
    borderRadius: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "1.5rem",
    flexShrink: 0,
  },
  actionButton: {
    width: "4rem",
    height: "4rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "1rem",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    color: "#9ca3af",
    flexShrink: 0,
  },
  loadingSpinner: {
    width: "3rem",
    height: "3rem",
    borderRadius: "50%",
    border: "2px solid #e5e7eb",
    borderTopColor: "#3b82f6",
    animation: "spin 1s linear infinite",
    marginBottom: "2rem",
  },
  emptyIcon: {
    width: "6rem",
    height: "6rem",
    marginBottom: "2rem",
    color: "#d1d5db",
  },
  emptyTitle: {
    fontSize: "1.5rem",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "1.5rem",
    textAlign: "center" as const,
  },
  emptyDescription: {
    fontSize: "1.25rem",
    color: "#6b7280",
    textAlign: "center" as const,
    lineHeight: "1.6",
  },
} as const;

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

  // Add keyframes for spinner animation if Tailwind doesn't work
  // TODO: remove CSS injection when migrating to CSS modules
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
      className={STYLES.overlay}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={inlineStyles.overlay}
    >
      <div
        className={STYLES.modal}
        onClick={handleModalClick}
        style={inlineStyles.modal}
      >
        {/* Header */}
        <div className={STYLES.header}>
          <h2
            id="modal-title"
            className={STYLES.title}
            style={inlineStyles.title}
          >
            {title}
          </h2>
          <button
            className={STYLES.closeButton}
            onClick={onClose}
            aria-label="閉じる"
            style={inlineStyles.closeButton}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ width: "2rem", height: "2rem" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className={STYLES.searchContainer}>
          <input
            type="text"
            className={STYLES.searchInput}
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            style={inlineStyles.searchInput}
          />
        </div>

        {/* Results */}
        <div className={STYLES.resultsContainer}>
          {isLoading ? (
            <div className={STYLES.loadingState}>
              <div className="flex flex-col items-center">
                <div
                  className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-8"
                  style={inlineStyles.loadingSpinner}
                ></div>
                <div
                  className="text-2xl font-medium"
                  style={{ fontSize: "1.5rem", fontWeight: "500" }}
                >
                  検索中...
                </div>
              </div>
            </div>
          ) : error ? (
            <div className={STYLES.emptyState}>
              <svg
                className={STYLES.emptyIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={inlineStyles.emptyIcon}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div
                className={STYLES.emptyTitle}
                style={inlineStyles.emptyTitle}
              >
                エラーが発生しました
              </div>
              <div
                className={STYLES.emptyDescription}
                style={inlineStyles.emptyDescription}
              >
                {error}
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className={STYLES.emptyState}>
              {searchQuery.trim() ? (
                <>
                  <svg
                    className={STYLES.emptyIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={inlineStyles.emptyIcon}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <div
                    className={STYLES.emptyTitle}
                    style={inlineStyles.emptyTitle}
                  >
                    該当するバス停が見つかりませんでした
                  </div>
                  <div
                    className={STYLES.emptyDescription}
                    style={inlineStyles.emptyDescription}
                  >
                    別のキーワードで検索してみてください
                  </div>
                </>
              ) : (
                <>
                  <svg
                    className={STYLES.emptyIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={inlineStyles.emptyIcon}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div
                    className={STYLES.emptyTitle}
                    style={inlineStyles.emptyTitle}
                  >
                    バス停を検索
                  </div>
                  <div
                    className={STYLES.emptyDescription}
                    style={inlineStyles.emptyDescription}
                  >
                    上の検索ボックスにバス停名を入力してください
                  </div>
                </>
              )}
            </div>
          ) : (
            searchResults.map((stop) => (
              <div
                key={stop.stop_id}
                className={STYLES.resultItem}
                onClick={() => handleSelectBusStop(stop)}
                role="button"
                tabIndex={0}
                style={inlineStyles.resultItem}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelectBusStop(stop);
                  }
                }}
              >
                <div className="flex items-center">
                  <div
                    className="flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mr-6 flex-shrink-0"
                    style={inlineStyles.iconContainer}
                  >
                    <svg
                      className="w-10 h-10 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        color: "#2563eb",
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={STYLES.resultText}
                      style={inlineStyles.resultText}
                    >
                      {stop.stop_name}
                    </div>
                    <div
                      className={STYLES.resultSubtext}
                      style={inlineStyles.resultSubtext}
                    >
                      バス停ID: {stop.stop_id}
                    </div>
                  </div>
                </div>
                <div
                  className="flex items-center justify-center w-16 h-16 rounded-2xl hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
                  style={inlineStyles.actionButton}
                >
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ width: "2rem", height: "2rem", color: "#9ca3af" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
