import { Search } from "lucide-react";

import styles from "./SearchInput.module.css";

interface SearchInputProps {
  onSearch: () => void;
}

function SearchIcon() {
  return <Search size={24} aria-hidden="true" />;
}

export function SearchInput({ onSearch }: SearchInputProps) {
  const handleClick = () => {
    onSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <div
          className={styles.inputWrapper}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-label="バス停・場所名を入力"
          aria-pressed="false"
        >
          <div className={styles.icon}>
            <SearchIcon />
          </div>
          <span className={styles.input}>バス停・場所名を入力</span>
        </div>
      </div>
    </div>
  );
}
