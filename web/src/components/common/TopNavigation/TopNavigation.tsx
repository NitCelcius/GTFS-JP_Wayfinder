import React from "react";

import { Icon } from "@/components/common/Icon/Icon";

import styles from "./TopNavigation.module.css";

interface TopNavigationProps {
  icon?: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

function BackIcon() {
  return (
    <Icon
      name="arrow-back"
      className="size-[var(--size-icon-lg)]"
      aria-hidden="true"
    />
  );
}

export function TopNavigation({
  icon,
  title = "",
  showBackButton = false,
  onBack,
  rightAction,
}: TopNavigationProps) {
  return (
    <div className={styles.container} data-name="HeaderLevel1">
      <div className={styles.content}>
        <div className={styles.inner}>
          {showBackButton && (
            <button onClick={onBack} className={styles.backButton}>
              <BackIcon />
            </button>
          )}
          {icon && <div className={styles.iconWrapper}>{icon}</div>}
          <div className={styles.title}>
            <h1 className={styles.titleText}>{title}</h1>
          </div>
          {rightAction && <div className="shrink-0">{rightAction}</div>}
        </div>
      </div>
    </div>
  );
}
