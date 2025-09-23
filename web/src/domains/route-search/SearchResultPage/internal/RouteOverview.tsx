interface RouteOverviewProps {
  fromStation: string;
  toStation: string;
}

// Style constants for better maintainability
const STYLES = {
  container: "px-[var(--size-spacing-lg)] py-[var(--size-spacing-md)] w-full",
  text: "flex flex-col font-['Inter',_'Noto_Sans_JP',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-black text-nowrap",
  textContent: "leading-[normal] whitespace-pre",
} as const;

export function RouteOverview({ fromStation, toStation }: RouteOverviewProps) {
  return (
    <div className={STYLES.container} data-name="RouteOverview">
      <div className={STYLES.text}>
        <p className={STYLES.textContent}>
          {fromStation} から {toStation} まで
        </p>
      </div>
    </div>
  );
}
