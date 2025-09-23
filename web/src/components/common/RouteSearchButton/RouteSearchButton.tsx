import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";

interface RouteSearchButtonProps {
  onClick: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

const STYLES = {
  buttonBase:
    "w-full rounded-[var(--border-radius-md)] px-[var(--spacing-lg)] py-[var(--spacing-xl)] flex items-center justify-center gap-[var(--spacing-md)] transition-opacity",
  buttonEnabled:
    "bg-[color:var(--route-origin-bg)] cursor-pointer hover:opacity-80",
  buttonDisabled: "bg-gray-300 cursor-not-allowed opacity-50",
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
  className,
  isLoading = false,
  disabled = false,
}: RouteSearchButtonProps) {
  const isDisabled = isLoading || disabled;
  const buttonStateClass = isDisabled
    ? STYLES.buttonDisabled
    : STYLES.buttonEnabled;
  const buttonClass = className
    ? `${STYLES.buttonBase} ${buttonStateClass} ${className}`
    : `${STYLES.buttonBase} ${buttonStateClass}`;

  return (
    <button className={buttonClass} onClick={onClick} disabled={isDisabled}>
      <div className={STYLES.icon}>
        {isLoading ? <LoadingSpinner size="sm" /> : <SearchIcon />}
      </div>
      <span className={STYLES.text}>
        {isLoading ? "検索中..." : "行き方を検索"}
      </span>
    </button>
  );
}
