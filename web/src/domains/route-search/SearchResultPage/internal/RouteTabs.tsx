import { RouteOption } from "../types";

interface RouteTabsProps {
  routes: RouteOption[];
  selectedIndex: number;
  onTabChange: (index: number) => void;
}

// Style constants for better maintainability
const STYLES = {
  container:
    "content-stretch flex justify-center gap-[var(--size-spacing-sm)] overflow-clip relative shrink-0 w-full px-[var(--size-spacing-lg)] py-[var(--size-spacing-sm)]",
  tab: "h-[var(--size-container-xs)] relative rounded-tl-[var(--radius-md)] rounded-tr-[var(--radius-md)] shrink-0 w-[8.6875rem] cursor-pointer transition-colors flex items-center justify-center font-['Inter',_'Noto_Sans_JP',_sans-serif] text-black text-center",
  tabActive: "bg-[var(--color-route-roundtrip-bg)]",
  tabInactive: "bg-[var(--color-route-inactive-bg)]",
  tabText: "leading-[normal]",
} as const;

export function RouteTabs({
  routes,
  selectedIndex,
  onTabChange,
}: RouteTabsProps) {
  return (
    <div className={STYLES.container} data-name="RouteTabs">
      {routes.map((route, index) => (
        <div
          key={route.id}
          className={`${STYLES.tab} ${
            index === selectedIndex ? STYLES.tabActive : STYLES.tabInactive
          }`}
          onClick={() => onTabChange(index)}
          data-name="RouteTab"
        >
          <p className={STYLES.tabText}>{route.name}</p>
        </div>
      ))}
    </div>
  );
}
