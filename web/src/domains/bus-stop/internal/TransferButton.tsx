import styles from "./TransferButton.module.css";

interface TransferButtonProps {
  onClick: () => void;
}

function TransferIcon() {
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
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  );
}

export function TransferButton({ onClick }: TransferButtonProps) {
  return (
    <button className={styles.button} onClick={onClick}>
      <div className={styles.icon}>
        <TransferIcon />
      </div>
      <span className={styles.text}>ここからバスで移動</span>
    </button>
  );
}
