import { formatDepartureTime } from "@/lib/utils";

interface SearchConditionsSummaryProps {
  departureTime: string;
}

// Style constants for better maintainability
const STYLES = {
  container: "px-[var(--size-spacing-lg)] py-[var(--size-spacing-md)] w-full",
  header:
    "content-stretch flex flex-col items-start gap-[var(--size-spacing-md)] relative shrink-0 w-full",
  title:
    "flex flex-col font-['Inter',_'Noto_Sans_JP',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-black text-nowrap",
  titleText: "leading-[normal] whitespace-pre",
  divider: "h-0 relative shrink-0 w-full",
  dividerSvg: "absolute bottom-0 left-0 right-0 top-[-0.0625rem]",
  dividerSvgElement: "block size-full",
  departureTime:
    "content-stretch flex items-center justify-center relative shrink-0 w-full",
  departureTimeLabel:
    "flex flex-col font-['Inter',_'Noto_Sans_JP',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-black text-nowrap",
  departureTimeText: "leading-[normal] whitespace-pre",
} as const;

export function SearchConditionsSummary({
  departureTime,
}: SearchConditionsSummaryProps) {
  return (
    <div className={STYLES.container} data-name="SearchConditionsSummary">
      <div className={STYLES.header}>
        <div className={STYLES.title}>
          <p className={STYLES.titleText}>検索条件</p>
        </div>

        <div className={STYLES.divider} data-name="Divider">
          <div className={STYLES.dividerSvg}>
            <svg
              className={STYLES.dividerSvgElement}
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 346 1"
            >
              <line
                stroke="var(--stroke-0, #8A8A8F)"
                strokeWidth="0.5"
                x1="0.00048828"
                x2="346"
                y1="0.75"
                y2="0.75"
              />
            </svg>
          </div>
        </div>

        <div className={STYLES.departureTime}>
          <div className={STYLES.departureTimeLabel}>
            <p className={STYLES.departureTimeText}>出発時刻 {formatDepartureTime(departureTime)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
