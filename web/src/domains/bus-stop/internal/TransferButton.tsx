import Image from "next/image";

import styles from "./TransferButton.module.css";

interface TransferButtonProps {
  onClick: () => void;
  floating?: boolean;
}

function TransferIcon() {
  return (
    <Image
      src="/icons/transfer.svg"
      alt=""
      width={24}
      height={24}
      unoptimized
      className="block size-full"
      aria-hidden="true"
    />
  );
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
