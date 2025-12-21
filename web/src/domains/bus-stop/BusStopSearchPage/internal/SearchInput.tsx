import { useState } from "react";

import { Icon } from "@/components/common";

import styles from "./SearchInput.module.css";

interface SearchInputProps {
  onSearch: (query: string) => void;
}

function SearchIcon() {
  return <Icon name="search" className={styles.iconSvg} />;
}

export function SearchInput({ onSearch }: SearchInputProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch(query);
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
