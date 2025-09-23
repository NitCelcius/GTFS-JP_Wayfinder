import { useState } from "react";
import styles from "./RouteTabs.module.css";

interface TabSwitcherProps {
  isActive: boolean;
  label: string;
  onClick: () => void;
}

function TabSwitcher({ isActive, label, onClick }: TabSwitcherProps) {
  const className = `${styles.tabSwitcher} ${
    isActive ? styles.active : styles.inactive
  }`;

  return (
    <div className={className} data-name="TabSwitcher" onClick={onClick}>
      <div className={styles.tabContent}>
        <p className={styles.tabText}>{label}</p>
      </div>
    </div>
  );
}

export function RouteTabs() {
  const [activeTab, setActiveTab] = useState<"oneWay" | "roundTrip">("oneWay");

  return (
    <div className={styles.container} data-name="Tabs">
      <TabSwitcher
        isActive={activeTab === "oneWay"}
        label="片道"
        onClick={() => setActiveTab("oneWay")}
      />
      <TabSwitcher
        isActive={activeTab === "roundTrip"}
        label="往復"
        onClick={() => setActiveTab("roundTrip")}
      />
    </div>
  );
}
