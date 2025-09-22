import { Route } from "../types";
import styles from "./RouteTabs.module.css";

interface RouteTabsProps {
  routes: Route[];
  selectedIndex: number;
  onTabChange: (index: number) => void;
}

export function RouteTabs({
  routes,
  selectedIndex,
  onTabChange,
}: RouteTabsProps) {
  return (
    <div className={styles.container} data-name="RouteTabs">
      {routes.map((route, index) => (
        <div
          key={route.id}
          className={`${styles.tab} ${
            index === selectedIndex ? styles.tabActive : styles.tabInactive
          }`}
          onClick={() => onTabChange(index)}
          data-name="RouteTab"
        >
          <div className={styles.tabText}>
            <p className={styles.tabTextContent}>{route.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
