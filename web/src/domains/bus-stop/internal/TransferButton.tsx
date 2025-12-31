import { ArrowLeftRight } from "lucide-react";

import styles from "./TransferButton.module.css";

interface TransferButtonProps {
  onClick: () => void;
  floating?: boolean;
}

function TransferIcon() {
  return <ArrowLeftRight size={24} aria-hidden="true" />;
}

export function TransferButton({
  onClick,
  floating = false,
}: TransferButtonProps) {
  const buttonElement = (
    <button className={styles.button} onClick={onClick}>
      <div className={styles.icon}>
        <TransferIcon />
      </div>
      <span className={styles.text}>ここからバスで移動</span>
    </button>
  );

  if (floating) {
    return <div className={styles.floatingContainer}>{buttonElement}</div>;
  }

  return buttonElement;
}
