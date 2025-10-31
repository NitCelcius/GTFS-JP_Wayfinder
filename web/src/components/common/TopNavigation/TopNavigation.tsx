import React from "react";

interface TopNavigationProps {
  icon?: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

const STYLES = {
  container:
    "top-0 left-0 right-0 w-full z-[110] bg-white border-b border-[color:var(--color-border)]",
  content:
    "flex flex-row items-center relative size-full max-w-[var(--max-w-mobile)] mx-auto",
  inner:
    "box-border content-stretch flex gap-[var(--size-spacing-sm)] items-center px-[var(--size-spacing-sm)] py-0 relative w-full min-h-[3.3125rem]",
  title:
    "flex flex-col font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative flex-1 text-black",
  titleText:
    "leading-[normal] text-[1.5rem]" /* slightly reduced for consistency */,
  iconWrapper:
    "relative shrink-0 size-[var(--size-icon-sm)] flex items-center justify-center",
} as const;

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
  title = "",
  showBackButton = false,
  onBack,
  rightAction,
}: TopNavigationProps) {
  return (
    <div className={STYLES.container} data-name="HeaderLevel1">
      <div className={STYLES.content}>
        <div className={STYLES.inner}>
          {showBackButton && (
            <button onClick={onBack} className="cursor-pointer">
              <BackIcon />
            </button>
          )}
          {icon && <div className={STYLES.iconWrapper}>{icon}</div>}
          <div className={STYLES.title}>
            <h1 className={STYLES.titleText}>{title}</h1>
          </div>
          {rightAction && <div className="shrink-0">{rightAction}</div>}
        </div>
      </div>
    </div>
  );
}
