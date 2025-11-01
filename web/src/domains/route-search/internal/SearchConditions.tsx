import { useState } from "react";

import { Button } from "@/components/common/Button/Button";
import { DepartureTimeModal } from "@/components/common/DepartureTimeModal";

// Design-reference style tokens (size-spacing-*, color-route-*)
const STYLES = {
  container: "relative shrink-0 w-full",
  content: "flex flex-col justify-center overflow-clip relative size-full",
  inner:
    "box-border content-stretch flex flex-col gap-[var(--size-spacing-md)] items-start justify-center px-[var(--size-spacing-2xl)] py-[var(--size-spacing-2xl)] relative w-full",
  searchHeader:
    "content-stretch flex flex-row items-center justify-between gap-[var(--size-spacing-md)] relative shrink-0 w-full",
  searchHeaderTitle:
    "flex flex-col font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-black text-nowrap",
  searchHeaderText: "leading-[normal] whitespace-pre",
  divider: "h-0 relative shrink-0 w-full max-w-[var(--max-w-mobile)]",
  dividerSvg: "absolute bottom-0 left-0 right-0 top-[-0.0625rem]",
  dividerSvgElement: "block size-full",
  departureTime: "relative shrink-0 w-full",
  departureTimeContent:
    "flex flex-row items-center justify-center overflow-clip relative size-full",
  departureTimeInner:
    "box-border content-stretch flex gap-[var(--size-spacing-md)] items-center justify-center leading-[0] not-italic p-[var(--size-spacing-md)] relative text-nowrap w-full",
  departureTimeLabel:
    "flex flex-col font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal justify-center relative shrink-0 text-black",
  departureTimeValue:
    "flex flex-col font-['Inter:Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center relative shrink-0 text-[color:var(--color-route-accent-text)] cursor-pointer",
  departureTimeValueText:
    "[text-underline-position:from-font] decoration-solid leading-[normal] text-nowrap underline whitespace-pre",
  departureTimeText: "leading-[normal] text-nowrap whitespace-pre",
} as const;

function SearchHeader() {
  return (
    <div className={STYLES.searchHeader}>
      <div className={STYLES.searchHeaderTitle}>
        <p className={STYLES.searchHeaderText}>検索条件</p>
      </div>
      <Button text="リセット" variant="reset" onClick={() => {}} />
    </div>
  );
}

function Divider() {
  return (
    <div className={STYLES.divider}>
      <div className={STYLES.dividerSvg}>
        <svg
          className={STYLES.dividerSvgElement}
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 346 1"
        >
          <line
            id="Line 1"
            stroke="var(--color-stroke-muted)"
            strokeWidth="0.5"
            x1="0.00048828"
            x2="346"
            y1="0.75"
            y2="0.75"
          />
        </svg>
      </div>
    </div>
  );
}

interface DepartureTimeProps {
  selectedDateTime?: Date;
  onDateTimeChange: (dateTime: Date | undefined) => void;
}

function DepartureTime({
  selectedDateTime,
  onDateTimeChange,
}: DepartureTimeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDisplayTime = (dateTime: Date | undefined) => {
    if (!dateTime) {
      return "今すぐ";
    }

    const month = dateTime.getMonth() + 1;
    const day = dateTime.getDate();
    const hours = dateTime.getHours().toString().padStart(2, "0");
    const minutes = dateTime.getMinutes().toString().padStart(2, "0");

    return `${month}月${day}日 ${hours}:${minutes}`;
  };

  const handleConfirm = (dateTime: Date | undefined) => {
    onDateTimeChange(dateTime);
  };

  return (
    <>
      <div className={STYLES.departureTime}>
        <div className={STYLES.departureTimeContent}>
          <div className={STYLES.departureTimeInner}>
            <div className={STYLES.departureTimeLabel}>
              <p className={STYLES.departureTimeText}>出発時刻</p>
            </div>
            <div
              className={STYLES.departureTimeValue}
              onClick={() => setIsModalOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setIsModalOpen(true);
                }
              }}
            >
              <p className={STYLES.departureTimeValueText}>
                {formatDisplayTime(selectedDateTime)}
              </p>
            </div>
          </div>
        </div>
      </div>
      <DepartureTimeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        initialDateTime={selectedDateTime}
      />
    </>
  );
}

interface SearchConditionsProps {
  selectedDateTime?: Date;
  onDateTimeChange: (dateTime: Date | undefined) => void;
}

export function SearchConditions({
  selectedDateTime,
  onDateTimeChange,
}: SearchConditionsProps) {
  return (
    <div className={STYLES.container}>
      <div className={STYLES.content}>
        <div className={STYLES.inner}>
          <SearchHeader />
          <Divider />
          <DepartureTime
            selectedDateTime={selectedDateTime}
            onDateTimeChange={onDateTimeChange}
          />
        </div>
      </div>
    </div>
  );
}
