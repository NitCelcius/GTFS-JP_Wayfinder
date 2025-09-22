import { useState } from "react";
import styles from "./SearchInput.module.css";

interface SearchInputProps {
  onSearch: (query: string) => void;
}

function SearchIcon() {
  return (
    <svg
      className={styles.iconSvg}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

export function SearchInput({ onSearch }: SearchInputProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputWrapper}>
          <div className={styles.icon}>
            <SearchIcon />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="バス停・場所名を入力"
            className={styles.input}
          />
        </div>
      </form>
    </div>
  );
}
