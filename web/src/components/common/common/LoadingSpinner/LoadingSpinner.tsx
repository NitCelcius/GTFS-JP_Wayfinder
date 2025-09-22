import clsx from "clsx";
import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "white" | "gray";
  className?: string;
}

const sizeClass = (size: "sm" | "md" | "lg") =>
  size === "sm"
    ? styles.spinnerSm
    : size === "lg"
    ? styles.spinnerLg
    : styles.spinnerMd;

const colorClass = (color: "primary" | "white" | "gray") =>
  color === "white"
    ? styles.colorWhite
    : color === "gray"
    ? styles.colorGray
    : styles.colorPrimary;

export function LoadingSpinner({
  size = "md",
  color = "primary",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div className={clsx(sizeClass(size), colorClass(color), className)}>
      <svg
        className={styles.svg}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className={styles.circleOpacity}
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className={styles.pathOpacity}
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}
