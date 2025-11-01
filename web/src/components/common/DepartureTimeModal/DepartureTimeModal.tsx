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
    date.setSeconds(0, 0);
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
      newDate.setSeconds(0, 0);
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
    now.setSeconds(0, 0);
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

  const handleDateChange = (
    field: "month" | "day" | "hour" | "minute",
    value: number
  ) => {
    setIsNow(false);
    const newDate = new Date(selectedDate);

    switch (field) {
      case "month": {
        // When changing month, preserve the day if valid, otherwise adjust to last day of month
        const currentDay = newDate.getDate();
        newDate.setMonth(value);
        // Check if day is still valid after month change
        const daysInNewMonth = new Date(
          newDate.getFullYear(),
          value + 1,
          0
        ).getDate();
        if (currentDay > daysInNewMonth) {
          newDate.setDate(daysInNewMonth);
        }
        setSelectedDate(newDate);
        break;
      }
      case "day":
        newDate.setDate(value);
        setSelectedDate(newDate);
        break;
      case "hour":
        newDate.setHours(value);
        setSelectedDate(newDate);
        break;
      case "minute":
        newDate.setMinutes(value);
        setSelectedDate(newDate);
        break;
    }
  };

  // Get number of days in the selected month
  const getDaysInMonth = () => {
    return new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0
    ).getDate();
  };

  if (!isOpen) return null;

  const daysInMonth = getDaysInMonth();
  const monthNames = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ];

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
              <div className={styles.pickerLabel}>月</div>
              <select
                className={styles.pickerSelect}
                value={selectedDate.getMonth()}
                onChange={(e) =>
                  handleDateChange("month", parseInt(e.target.value))
                }
              >
                {monthNames.map((name, index) => (
                  <option key={index} value={index}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.pickerColumn}>
              <div className={styles.pickerLabel}>日</div>
              <select
                className={styles.pickerSelect}
                value={selectedDate.getDate()}
                onChange={(e) =>
                  handleDateChange("day", parseInt(e.target.value))
                }
              >
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                  (day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className={styles.pickerColumn}>
              <div className={styles.pickerLabel}>時</div>
              <select
                className={styles.pickerSelect}
                value={selectedDate.getHours()}
                onChange={(e) =>
                  handleDateChange("hour", parseInt(e.target.value))
                }
              >
                {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                  <option key={hour} value={hour}>
                    {hour.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.pickerColumn}>
              <div className={styles.pickerLabel}>分</div>
              <select
                className={styles.pickerSelect}
                value={selectedDate.getMinutes()}
                onChange={(e) =>
                  handleDateChange("minute", parseInt(e.target.value))
                }
              >
                {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                  <option key={minute} value={minute}>
                    {minute.toString().padStart(2, "0")}
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
