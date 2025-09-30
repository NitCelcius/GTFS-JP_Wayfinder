"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import styles from "./ErrorPage.module.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.root}>
      <h2 className={styles.title}>Something went wrong!</h2>
      <p className={styles.message}>
        There was an error loading the search results.
      </p>
      <div className={styles.buttonRow}>
        <button onClick={reset} className={styles.primaryBtn}>
          Try again
        </button>
        <button
          onClick={() => router.push("/")}
          className={styles.secondaryBtn}
        >
          Go back to search
        </button>
      </div>
    </div>
  );
}
