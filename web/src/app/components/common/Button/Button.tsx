import styles from "./Button.module.css";
import clsx from "clsx";

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
  const buttonClasses = clsx(
    styles.button,
    variant === "reset" ? styles.reset : styles.default,
    className
  );

  return (
    <button className={buttonClasses} onClick={onClick} type="button">
      <div className={styles.buttonText}>
        <p className={styles.text}>{text}</p>
      </div>
    </button>
  );
}
