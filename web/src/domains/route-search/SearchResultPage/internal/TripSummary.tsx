import { RouteOption } from "../types";

interface TripSummaryProps {
  route: RouteOption;
}

// Style constants for better maintainability
const STYLES = {
  container: "px-[var(--size-spacing-lg)] py-[var(--size-spacing-md)] w-full",
  timeRange:
    "content-stretch flex items-center justify-center relative shrink-0 w-full mb-[var(--size-spacing-sm)]",
  timeText:
    "flex flex-col font-['Inter',_'Noto_Sans_JP',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-black text-nowrap",
  timeTextContent: "leading-[normal] whitespace-pre",
  details:
    "content-stretch flex items-center justify-center relative shrink-0 w-full",
  detailsText:
    "flex flex-col font-['Inter',_'Noto_Sans_JP',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-black text-nowrap",
  detailsTextContent: "leading-[normal] whitespace-pre",
} as const;

export function TripSummary({ route }: TripSummaryProps) {
  return (
    <div className={STYLES.container} data-name="TripSummary">
      <div className={STYLES.timeRange}>
        <div className={STYLES.timeText}>
          <p className={STYLES.timeTextContent}>
            {route.departureTime} → {route.arrivalTime} ({route.duration})
          </p>
        </div>
      </div>

      <div className={STYLES.details}>
        <div className={STYLES.detailsText}>
          <p className={STYLES.detailsTextContent}>
            乗換 {route.transferCount}回 / 合計 {route.totalCost}円
          </p>
        </div>
      </div>
    </div>
  );
}
