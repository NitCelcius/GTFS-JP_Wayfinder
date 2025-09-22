import styles from "./RouteSearchButton.module.css";

interface RouteSearchButtonProps {
  onClick: () => void;
}

function SearchIcon() {
  return (
    <svg
      className={styles.iconSvg}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

export function RouteSearchButton({ onClick }: RouteSearchButtonProps) {
  return (
    <button className={styles.button} onClick={onClick}>
      <div className={styles.icon}>
        <SearchIcon />
      </div>
      <span className={styles.text}>行き方を検索</span>
    </button>
  );
}
