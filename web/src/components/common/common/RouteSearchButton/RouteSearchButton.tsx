import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";
import clsx from "clsx";
import styles from "./RouteSearchButton.module.css";

interface RouteSearchButtonProps {
  onClick: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  isLoading?: boolean;
}

// styles are provided via RouteSearchButton.module.css

function SearchIcon() {
  return (
    <svg
      className="block size-full"
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

export function RouteSearchButton({
  onClick,
  variant: _variant = "primary",
  className,
  isLoading = false,
}: RouteSearchButtonProps) {
  const buttonClass = clsx(styles.button, className);

  return (
    <button className={buttonClass} onClick={onClick} disabled={isLoading}>
      <div className={styles.icon}>
        {isLoading ? <LoadingSpinner size="sm" /> : <SearchIcon />}
      </div>
      <span className={styles.text}>
        {isLoading ? "検索中..." : "行き方を検索"}
      </span>
    </button>
  );
}
