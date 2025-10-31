interface RouteOverviewProps {
  fromStation: string;
  toStation: string;
  searchUrl?: string;
  onShareClick?: () => void;
}

function ShareIcon() {
  return (
    <svg
      className="block size-full"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}

// Style constants for better maintainability
const STYLES = {
  container: "px-[var(--size-spacing-lg)] py-[var(--size-spacing-md)] w-full",
  wrapper:
    "flex items-center justify-between gap-[var(--size-spacing-md)] w-full",
  text: "flex flex-col font-['Inter',_'Noto_Sans_JP',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-black text-nowrap flex-1 min-w-0",
  textContent: "leading-[normal] whitespace-pre",
  shareButton:
    "flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer p-1 transition-opacity duration-200 hover:opacity-70 active:opacity-50 flex-shrink-0",
  shareIcon:
    "w-6 h-6 flex items-center justify-center text-[var(--color-primary,#3b82f6)]",
  shareLabel: "text-xs text-[var(--color-primary,#3b82f6)] whitespace-nowrap",
} as const;

export function RouteOverview({
  fromStation,
  toStation,
  searchUrl,
  onShareClick,
}: RouteOverviewProps) {
  return (
    <div className={STYLES.container} data-name="RouteOverview">
      <div className={STYLES.wrapper}>
        <div className={STYLES.text}>
          <p className={STYLES.textContent}>
            {fromStation} から {toStation} まで
          </p>
        </div>
        {searchUrl && (
          <button
            className={STYLES.shareButton}
            onClick={onShareClick}
            aria-label="共有"
          >
            <div className={STYLES.shareIcon}>
              <ShareIcon />
            </div>
            <span className={STYLES.shareLabel}>共有</span>
          </button>
        )}
      </div>
    </div>
  );
}
