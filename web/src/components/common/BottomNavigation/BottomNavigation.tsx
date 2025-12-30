import { Clock, MapPin, Route } from "lucide-react";

import { useRef } from "react";

import styles from "./BottomNavigation.module.css";

function BusStopIcon() {
  return (
    <div className={styles.locationIcon} data-name="bus_stop">
      <MapPin size={32} />
    </div>
  );
}

function RouteIcon() {
  return (
    <div className={styles.mapSearchIcon} data-name="route">
      <Route size={32} />
    </div>
  );
}

function RecentIcon() {
  return (
    <div className={styles.bookmarkIcon} data-name="recent">
      <Clock size={32} />
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, isActive = false, onClick }: NavItemProps) {
  const navItemClass = isActive
    ? `${styles.navItem} ${styles.navItemActive}`
    : styles.navItem;
  const navItemRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = navItemRef.current;
    if (!element) return;

    // Create ripple element
    const ripple = document.createElement("span");
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    // Apply appropriate ripple color class
    ripple.className = `${styles.ripple} ${isActive ? styles.rippleDisabled : styles.ripplePrimary}`;

    element.appendChild(ripple);

    // Remove ripple after animation completes
    setTimeout(() => {
      ripple.remove();
    }, 600);

    onClick();
  };

  return (
    <div
      ref={navItemRef}
      className={navItemClass}
      data-name="NavItem"
      onClick={handleClick}
    >
      {icon}
      <div className={styles.navItemText}>
        <p className={styles.navItemLabel}>{label}</p>
      </div>
    </div>
  );
}

interface BottomNavigationProps {
  activeTab?: "bus-stop" | "route" | "recent";
  onTabClick?: (tab: "bus-stop" | "route" | "recent") => void;
}

export function BottomNavigation({
  activeTab = "route",
  onTabClick,
}: BottomNavigationProps) {
  return (
    <div className={styles.bottomNav} data-name="Footer">
      <div className={styles.content}>
        <div className={styles.inner}>
          <NavItem
            icon={<BusStopIcon />}
            label="バス停"
            isActive={activeTab === "bus-stop"}
            onClick={() => onTabClick?.("bus-stop")}
          />
          <NavItem
            icon={<RouteIcon />}
            label="行き方"
            isActive={activeTab === "route"}
            onClick={() => onTabClick?.("route")}
          />
          <NavItem
            icon={<RecentIcon />}
            label="履歴"
            isActive={activeTab === "recent"}
            onClick={() => onTabClick?.("recent")}
          />
        </div>
      </div>
    </div>
  );
}
