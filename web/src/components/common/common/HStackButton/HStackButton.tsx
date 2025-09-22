interface HStackButtonProps {
  icon: React.ReactNode;
  text: string;
  backgroundColor?: string;
  onClick: () => void;
}

import styles from "./HStackButton.module.css";

export function HStackButton({
  icon,
  text,
  backgroundColor = "var(--color-route-origin-bg)",
  onClick,
}: HStackButtonProps) {
  return (
    <div
      className={styles.searchButton}
      style={{ backgroundColor }}
      data-name="HStackButton"
      onClick={onClick}
    >
      {icon}
      <div className={styles.searchText}>
        <p className={styles.searchTextContent}>{text}</p>
      </div>
    </div>
  );
}
