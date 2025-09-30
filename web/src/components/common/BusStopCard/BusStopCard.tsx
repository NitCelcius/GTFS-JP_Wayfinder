import React from "react";

import { Card } from "../Card";
import styles from "./BusStopCard.module.css";

interface BusStopCardProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  actionLabel: string;
  onClick?: () => void;
  onActionClick?: (e: React.MouseEvent) => void;
  secondaryInfo?: string; // for additional info like "searched at" time
}

export function BusStopCard({
  title,
  subtitle,
  icon,
  actionLabel,
  onClick,
  onActionClick,
  secondaryInfo,
}: BusStopCardProps) {
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onActionClick?.(e);
  };

  return (
    <Card onClick={onClick}>
      <div className={styles.root}>
        <div className={styles.left}>
          {icon && <div className={styles.icon}>{icon}</div>}
          <div className={styles.textGroup}>
            <span className={styles.title}>{title}</span>
            <div className={styles.subtitleRow}>
              <span className={styles.subtitle}>{subtitle}</span>
              {secondaryInfo && (
                <span className={styles.secondary}>・{secondaryInfo}</span>
              )}
            </div>
          </div>
        </div>
        <div className={styles.actionWrap}>
          <button className={styles.actionBtn} onClick={handleActionClick}>
            <span className={styles.actionLabel}>{actionLabel}</span>
          </button>
        </div>
      </div>
    </Card>
  );
}
