import { ArrowDown, ArrowUpDown, Flag, MapPin } from "lucide-react";

import { useState } from "react";

import { BusStopSearchModalContainer } from "@/components/common";
import type { BusStopSearchResult } from "@/types";

import styles from "./RouteInputs.module.css";

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
  const IconComponent = type === "origin" ? MapPin : Flag;
  const inputClass = onInputClick
    ? `${styles.inputField} ${styles.inputFieldClickable}`
    : styles.inputField;

  return (
    <div className={`${styles.routeInput} ${bgClass}`}>
      <div className={styles.icon}>
        <IconComponent className={styles.iconSvg} aria-hidden="true" />
      </div>
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
              <ArrowDown className={styles.iconSvg} aria-hidden="true" />
            </div>
          </div>
          <button className={styles.swapButton} onClick={handleSwap}>
            <div className={styles.swapIcon}>
              <ArrowUpDown size={24} aria-hidden="true" />
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
