interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: "default" | "reset";
  className?: string;
}

// Style constants for better maintainability (using rem-based values)
const STYLES = {
  button:
    "box-border content-stretch flex gap-[var(--spacing-md)] items-center justify-center px-[var(--spacing-3xl)] py-[0.75rem] relative rounded-[var(--border-radius-md)] shrink-0 cursor-pointer hover:opacity-90 transition-opacity border-none font-['Inter',_'Noto_Sans_JP',_sans-serif]",
  buttonText:
    "flex flex-col font-['Inter',_'Noto_Sans_JP',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-black text-nowrap",
  text: "leading-[normal] whitespace-pre m-0",
  default: "bg-[color:var(--route-origin-bg)]",
  reset: "bg-[color:var(--route-inactive-bg)]",
} as const;

export function Button({
  text,
  onClick,
  variant = "default",
  className = "",
}: ButtonProps) {
  const buttonClasses = [STYLES.button, STYLES[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={buttonClasses} onClick={onClick} type="button">
      <div className={STYLES.buttonText}>
        <p className={STYLES.text}>{text}</p>
      </div>
    </button>
  );
}
