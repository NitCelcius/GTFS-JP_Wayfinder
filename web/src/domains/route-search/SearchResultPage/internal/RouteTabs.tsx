import { RouteOption } from "../types";
import styles from "./RouteTabs.module.css";

interface RouteTabsProps {
  routes: RouteOption[];
  selectedIndex: number;
  onTabChange: (index: number) => void;
}

export function RouteTabs({
  routes,
  selectedIndex,
  onTabChange,
}: RouteTabsProps) {
  return (
    <div className={styles.container}>
      {routes.map((route, index) => (
        <div
          key={route.id}
          className={`${styles.tab} ${
            index === selectedIndex ? styles.tabActive : styles.tabInactive
          }`}
          onClick={() => onTabChange(index)}
        >
          <p className={styles.tabText}>{route.name}</p>
        </div>
      ))}
    </div>
  );
}
