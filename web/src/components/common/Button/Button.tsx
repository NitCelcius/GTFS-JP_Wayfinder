import styles from "./Button.module.css";

interface ButtonProps {
  text: string;
  onClick: () => void;
  className?: string;
}

export function Button({ text, onClick, className = "" }: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${className}`}
      onClick={onClick}
      type="button"
    >
      <div className={styles.buttonText}>
        <p className={styles.text}>{text}</p>
      </div>
    </button>
  );
}
