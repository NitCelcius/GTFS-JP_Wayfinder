import Image from "next/image";

import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";
import styles from "./RouteSearchButton.module.css";

interface RouteSearchButtonProps {
  onClick: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

function SearchIcon() {
  return (
    <Image
      src="/icons/search.svg"
      alt=""
      width={24}
      height={24}
      unoptimized
      className="block size-full"
      aria-hidden="true"
    />
  );
}

export function RouteSearchButton({
  onClick,
  className,
  isLoading = false,
  disabled = false,
}: RouteSearchButtonProps) {
  const isDisabled = isLoading || disabled;
  const buttonStateClass = isDisabled
    ? styles.buttonDisabled
    : styles.buttonEnabled;
  const buttonClass = className
    ? `${styles.buttonBase} ${buttonStateClass} ${className}`
    : `${styles.buttonBase} ${buttonStateClass}`;

  return (
    <button className={buttonClass} onClick={onClick} disabled={isDisabled}>
      <div className={styles.icon}>
        {isLoading ? <LoadingSpinner size="sm" /> : <SearchIcon />}
      </div>
      <span className={styles.text}>
        {isLoading ? "検索中..." : "行き方を検索"}
      </span>
    </button>
  );
}
