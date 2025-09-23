import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";

interface RouteSearchButtonProps {
  onClick: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  isLoading?: boolean;
}

const STYLES = {
  button:
    "w-full bg-[color:var(--route-origin-bg)] rounded-[var(--border-radius-md)] px-[var(--spacing-lg)] py-[var(--spacing-xl)] flex items-center justify-center gap-[var(--spacing-md)] cursor-pointer hover:opacity-80 transition-opacity",
  icon: "w-[1.5rem] h-[1.5rem] flex items-center justify-center",
  text: "text-[1rem]",
} as const;

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
  variant = "primary",
  className,
  isLoading = false,
}: RouteSearchButtonProps) {
  const buttonClass = className
    ? `${STYLES.button} ${className}`
    : STYLES.button;

  return (
    <button className={buttonClass} onClick={onClick} disabled={isLoading}>
      <div className={STYLES.icon}>
        {isLoading ? <LoadingSpinner size="sm" /> : <SearchIcon />}
      </div>
      <span className={STYLES.text}>
        {isLoading ? "検索中..." : "行き方を検索"}
      </span>
    </button>
  );
}
