import { ReactNode } from "react";

import styles from "./ActionButtonBar.module.css";

interface ActionButton {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  ariaLabel?: string;
}

interface ActionButtonBarProps {
  buttons: ActionButton[];
}

export function ActionButtonBar({ buttons }: ActionButtonBarProps) {
  return (
    <div className={styles.container}>
      {buttons.map((button, index) => (
        <button
          key={index}
          className={styles.button}
          onClick={button.onClick}
          aria-label={button.ariaLabel || button.label}
        >
          <div className={styles.icon}>{button.icon}</div>
          <span className={styles.label}>{button.label}</span>
        </button>
      ))}
    </div>
  );
}
