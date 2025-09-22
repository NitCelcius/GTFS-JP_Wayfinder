import styles from "./SearchButton.module.css";

interface SearchButtonProps {
  icon: React.ReactNode;
  text: string;
  backgroundColor?: string;
  onClick: () => void;
}

export function SearchButton({
  icon,
  text,
  backgroundColor = "var(--color-route-origin-bg)",
  onClick,
}: SearchButtonProps) {
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
