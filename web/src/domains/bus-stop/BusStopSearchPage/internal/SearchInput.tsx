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

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <div
          className={styles.inputWrapper}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleClick();
            }
          }}
        >
          <div className={styles.icon}>
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="バス停・場所名を入力"
            className={styles.input}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
