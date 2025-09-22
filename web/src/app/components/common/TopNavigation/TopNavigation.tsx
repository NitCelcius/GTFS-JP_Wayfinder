import styles from "./TopNavigation.module.css";

interface TopNavigationProps {
  icon?: React.ReactNode;
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

function BackIcon() {
  return (
    <div className="relative shrink-0 size-[var(--size-icon-lg)]">
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
          d="M19 12H5m0 0l7 7m-7-7l7-7"
        />
      </svg>
    </div>
  );
}

export function TopNavigation({
  icon,
  title,
  showBackButton = false,
  onBack,
}: TopNavigationProps) {
  return (
    <div className={styles.container} data-name="HeaderLevel1">
      <div className={styles.content}>
        <div className={styles.inner}>
          {showBackButton && (
            <button onClick={onBack} className="cursor-pointer">
              <BackIcon />
            </button>
          )}
          {icon && <div className={styles.iconWrapper}>{icon}</div>}
          <div className={styles.title}>
            <p className={styles.titleText}>{title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
