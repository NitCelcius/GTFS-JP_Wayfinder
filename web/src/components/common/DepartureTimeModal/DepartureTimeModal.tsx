import { useEffect, useState } from "react";

import styles from "./DepartureTimeModal.module.css";

interface DepartureTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dateTime: Date | undefined) => void;
  initialDateTime?: Date;
}

export function DepartureTimeModal({
  isOpen,
  onClose,
  onConfirm,
  initialDateTime,
}: DepartureTimeModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const date = initialDateTime || new Date();
    date.setMinutes(0, 0, 0);
    return date;
  });

  // Track if the selected time is "now" (undefined state)
  const [isNow, setIsNow] = useState<boolean>(!initialDateTime);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Reset to initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      const newDate = initialDateTime || new Date();
      newDate.setMinutes(0, 0, 0);
      setSelectedDate(newDate);
      setIsNow(!initialDateTime);
    }
  }, [isOpen, initialDateTime]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleNowClick = () => {
    setIsNow(true);
    const now = new Date();
    now.setMinutes(0, 0, 0);
    setSelectedDate(now);
  };

  const handleConfirm = () => {
    // If "now" is selected or selected time equals current time (within 1 minute), pass undefined
    const now = new Date();
    const timeDiff = Math.abs(selectedDate.getTime() - now.getTime());
    const oneMinute = 60 * 1000;

    if (isNow || timeDiff < oneMinute) {
      onConfirm(undefined);
    } else {
      onConfirm(selectedDate);
    }
    onClose();
  };

  const handleDateChange = (field: "day" | "hour", value: number) => {
    setIsNow(false);
    const newDate = new Date(selectedDate);

    switch (field) {
      case "day": {
        // Adjust the day relative to today
        const today = new Date();
        today.setHours(newDate.getHours(), 0, 0, 0);
        today.setDate(today.getDate() + value);
        setSelectedDate(today);
        break;
      }
      case "hour":
        newDate.setHours(value);
        newDate.setMinutes(0);
        setSelectedDate(newDate);
        break;
    }
  };

  // Calculate day offset from today (0 = today, 1 = tomorrow, etc.)
  const getDayOffset = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    return Math.floor((selected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getDayLabel = (offset: number) => {
    switch (offset) {
      case 0:
        return "今日";
      case 1:
        return "明日";
      case 2:
        return "明後日";
      default:
        return `${offset}日後`;
    }
  };

  if (!isOpen) return null;

  const currentDayOffset = getDayOffset();

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.modal} onClick={handleModalClick}>
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            出発時刻
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="閉じる"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width={32}
              height={32}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.nowButtonContainer}>
            <button
              className={`${styles.nowButton} ${isNow ? styles.nowButtonActive : ""}`}
              onClick={handleNowClick}
            >
              今すぐ
            </button>
          </div>

          <div className={styles.pickerContainer}>
            <div className={styles.pickerColumn}>
              <div className={styles.pickerLabel}>日</div>
              <select
                className={styles.pickerSelect}
                value={currentDayOffset}
                onChange={(e) => handleDateChange("day", parseInt(e.target.value))}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((offset) => (
                  <option key={offset} value={offset}>
                    {getDayLabel(offset)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.pickerColumn}>
              <div className={styles.pickerLabel}>時</div>
              <select
                className={styles.pickerSelect}
                value={selectedDate.getHours()}
                onChange={(e) => handleDateChange("hour", parseInt(e.target.value))}
              >
                {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                  <option key={hour} value={hour}>
                    {hour.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.confirmButton} onClick={handleConfirm}>
            決定
          </button>
        </div>
      </div>
    </div>
  );
}
