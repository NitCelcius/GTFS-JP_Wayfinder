import { useState } from "react";

import svgPaths from "@/app/imports/svg-uqfc70duf5";
import { BusStopSearchModal } from "@/components/common";
import type { BusStopSearchResult } from "@/types";

// Design-reference style constants
const STYLES = {
  container: "flex flex-col gap-[var(--size-spacing-sm)] w-full",
  icon: "relative shrink-0 w-[var(--size-icon-lg)] h-[var(--size-icon-lg)]",
  iconSvg: "block size-full",
  arrowContainer:
    "flex h-[var(--size-icon-md)] items-center justify-center relative shrink-0 w-[var(--size-icon-md)]",
  arrowIcon: "relative w-[var(--size-icon-md)] h-[var(--size-icon-md)]",
  arrowIconDown: "flex-none rotate-[90deg]",
  routeInput:
    "box-border content-stretch flex gap-[var(--size-spacing-sm)] h-[var(--size-container-sm)] items-center p-[var(--size-spacing-sm)] relative rounded-[var(--radius-lg)] shrink-0 w-full max-w-[var(--max-w-mobile)]",
  inputField:
    "flex-1 bg-transparent border-none outline-none text-black placeholder:text-[color:var(--color-route-placeholder-text)]",
  inputFieldClickable:
    "flex-1 bg-transparent border-none outline-none text-black placeholder:text-[color:var(--color-route-placeholder-text)] cursor-pointer",
  swapButtonContainer:
    "flex flex-row items-center justify-center gap-[var(--size-spacing-md)] py-[var(--size-spacing-sm)]",
  swapButton:
    "flex flex-col items-center justify-center gap-[var(--size-spacing-xs)] cursor-pointer hover:opacity-80 transition-opacity",
  swapIcon: "w-[1.5rem] h-[1.5rem] flex items-center justify-center",
  swapText: "text-[0.75rem] text-gray-600",
} as const;

const INPUT_BACKGROUNDS = {
  origin: "bg-[color:var(--color-route-origin-bg)]",
  destination: "bg-[color:var(--color-route-destination-bg)]",
} as const;

function LocationIcon() {
  return (
    <div className={STYLES.icon}>
      <svg className={STYLES.iconSvg} viewBox="0 0 44 44" aria-hidden="true">
        <path
          d={svgPaths.pb48f200}
          fill="var(--color-foreground)"
          shapeRendering="geometricPrecision"
        />
      </svg>
    </div>
  );
}

function FlagIcon() {
  return (
    <div className={STYLES.icon}>
      <svg className={STYLES.iconSvg} viewBox="0 0 44 44" aria-hidden="true">
        <path
          d={svgPaths.p32615cf0}
          fill="var(--color-foreground)"
          shapeRendering="geometricPrecision"
        />
      </svg>
    </div>
  );
}

function ArrowIcon() {
  return (
    <div className={STYLES.arrowIcon}>
      <svg className={STYLES.iconSvg} viewBox="0 0 40 40" aria-hidden="true">
        <path
          d={svgPaths.p3d8ec380}
          fill="var(--color-foreground)"
          shapeRendering="geometricPrecision"
        />
      </svg>
    </div>
  );
}

function SwapIcon() {
  return (
    <svg
      className="block size-full"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
      />
    </svg>
  );
}

interface RouteInputProps {
  type: "origin" | "destination";
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onInputClick?: () => void;
}

function RouteInput({
  type,
  placeholder,
  value,
  onChange,
  onInputClick,
}: RouteInputProps) {
  const bgClass =
    type === "origin"
      ? INPUT_BACKGROUNDS.origin
      : INPUT_BACKGROUNDS.destination;
  const Icon = type === "origin" ? LocationIcon : FlagIcon;
  const inputClass = onInputClick
    ? STYLES.inputFieldClickable
    : STYLES.inputField;

  return (
    <div className={`${STYLES.routeInput} ${bgClass}`}>
      <Icon />
      <input
        type="text"
        className={inputClass}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={onInputClick}
        readOnly={!!onInputClick}
      />
    </div>
  );
}

interface RouteInputsProps {
  originValue: string;
  destinationValue: string;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onOriginStopSelect?: (result: BusStopSearchResult) => void;
  onDestinationStopSelect?: (result: BusStopSearchResult) => void;
}

export function RouteInputs({
  originValue,
  destinationValue,
  onOriginChange,
  onDestinationChange,
  onOriginStopSelect,
  onDestinationStopSelect,
}: RouteInputsProps) {
  const [isOriginModalOpen, setIsOriginModalOpen] = useState(false);
  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);

  const handleSwap = () => {
    onOriginChange(destinationValue);
    onDestinationChange(originValue);
  };

  const handleOriginSelect = (result: BusStopSearchResult) => {
    onOriginChange(result.stop_name);
    onOriginStopSelect?.(result);
    setIsOriginModalOpen(false);
  };

  const handleDestinationSelect = (result: BusStopSearchResult) => {
    onDestinationChange(result.stop_name);
    onDestinationStopSelect?.(result);
    setIsDestinationModalOpen(false);
  };

  return (
    <>
      <div className={STYLES.container}>
        <RouteInput
          type="origin"
          placeholder="出発するバス停・場所"
          value={originValue}
          onChange={onOriginChange}
          onInputClick={
            onOriginStopSelect ? () => setIsOriginModalOpen(true) : undefined
          }
        />
        <div className={STYLES.swapButtonContainer}>
          <div className={STYLES.arrowContainer}>
            <div className={STYLES.arrowIconDown}>
              <ArrowIcon />
            </div>
          </div>
          <button className={STYLES.swapButton} onClick={handleSwap}>
            <div className={STYLES.swapIcon}>
              <SwapIcon />
            </div>
            <span className={STYLES.swapText}>入れ替え</span>
          </button>
        </div>
        <RouteInput
          type="destination"
          placeholder="行きたいバス停・場所"
          value={destinationValue}
          onChange={onDestinationChange}
          onInputClick={
            onDestinationStopSelect
              ? () => setIsDestinationModalOpen(true)
              : undefined
          }
        />
      </div>

      {/* Modals */}
      <BusStopSearchModal
        isOpen={isOriginModalOpen}
        onClose={() => setIsOriginModalOpen(false)}
        onSelectBusStop={handleOriginSelect}
        title="出発地を選択"
        placeholder="出発するバス停名を入力"
      />

      <BusStopSearchModal
        isOpen={isDestinationModalOpen}
        onClose={() => setIsDestinationModalOpen(false)}
        onSelectBusStop={handleDestinationSelect}
        title="目的地を選択"
        placeholder="行きたいバス停名を入力"
      />
    </>
  );
}
