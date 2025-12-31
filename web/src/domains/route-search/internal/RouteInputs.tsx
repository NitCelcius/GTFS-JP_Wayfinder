import { ArrowDown, ArrowUpDown, Flag, MapPin } from "lucide-react";

import { useState } from "react";

import { BusStopSearchModalContainer } from "@/components/common";
import type { BusStopSearchResult } from "@/types";

import styles from "./RouteInputs.module.css";

function LocationIcon() {
  return (
    <div className={styles.icon}>
      <MapPin className={styles.iconSvg} aria-hidden="true" />
    </div>
  );
}

function FlagIcon() {
  return (
    <div className={styles.icon}>
      <Flag className={styles.iconSvg} aria-hidden="true" />
    </div>
  );
}

function ArrowIcon() {
  return (
    <div className={styles.arrowIcon}>
      <ArrowDown className={styles.iconSvg} aria-hidden="true" />
    </div>
  );
}

function SwapIcon() {
  return <ArrowUpDown size={24} />;
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
  const bgClass = type === "origin" ? styles.bgOrigin : styles.bgDestination;
  const Icon = type === "origin" ? LocationIcon : FlagIcon;
  const inputClass = onInputClick
    ? `${styles.inputField} ${styles.inputFieldClickable}`
    : styles.inputField;

  return (
    <div className={`${styles.routeInput} ${bgClass}`}>
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
      <div className={styles.container}>
        <RouteInput
          type="origin"
          placeholder="出発するバス停・場所"
          value={originValue}
          onChange={onOriginChange}
          onInputClick={
            onOriginStopSelect ? () => setIsOriginModalOpen(true) : undefined
          }
        />
        <div className={styles.swapButtonContainer}>
          <div className={styles.arrowContainer}>
            <div className={styles.arrowIconDown}>
              <ArrowIcon />
            </div>
          </div>
          <button className={styles.swapButton} onClick={handleSwap}>
            <div className={styles.swapIcon}>
              <SwapIcon />
            </div>
            <span className={styles.swapText}>入れ替え</span>
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
      <BusStopSearchModalContainer
        isOpen={isOriginModalOpen}
        onCanceled={() => setIsOriginModalOpen(false)}
        onSelected={handleOriginSelect}
        title="出発地を選択"
        placeholder="出発するバス停名を入力"
      />

      <BusStopSearchModalContainer
        isOpen={isDestinationModalOpen}
        onCanceled={() => setIsDestinationModalOpen(false)}
        onSelected={handleDestinationSelect}
        title="目的地を選択"
        placeholder="行きたいバス停名を入力"
      />
    </>
  );
}
