import styles from "./Button.module.css";

interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: "default" | "reset";
  className?: string;
}

export function Button({
  text,
  onClick,
  variant = "default",
  className = "",
}: ButtonProps) {
  const buttonClasses = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={buttonClasses} onClick={onClick} type="button">
      <div className={styles.buttonText}>
        <p className={styles.text}>{text}</p>
      </div>
    </button>
  );
}
