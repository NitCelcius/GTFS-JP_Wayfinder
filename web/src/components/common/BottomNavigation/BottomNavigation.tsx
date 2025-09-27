import { Clock, MapPin, Route } from "lucide-react";

import styles from "./BottomNavigation.module.css";

function BusStopIcon() {
  return (
    <div className={styles.locationIcon} data-name="bus_stop">
      <MapPin size={26} />
    </div>
  );
}

function RouteIcon() {
  return (
    <div className={styles.mapSearchIcon} data-name="route">
      <Route size={26} />
    </div>
  );
}

function RecentIcon() {
  return (
    <div className={styles.bookmarkIcon} data-name="recent">
      <Clock size={26} />
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

  return (
    <div className={navItemClass} data-name="NavItem" onClick={onClick}>
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
