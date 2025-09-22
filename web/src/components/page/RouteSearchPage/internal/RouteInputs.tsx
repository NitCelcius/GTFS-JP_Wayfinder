import { useState } from "react";
import svgPaths from "@/components/imports/svg-uqfc70duf5";
import styles from "./RouteInputs.module.css";

function LocationIcon() {
  return (
    <div className={styles.icon} data-name="Icon">
      <svg
        className={styles.iconSvg}
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 44 44"
      >
        <g id="Icon">
          <mask
            height="44"
            id="mask0_1_317"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
            width="44"
            x="0"
            y="0"
          >
            <rect
              fill="var(--fill-0, #D9D9D9)"
              height="44"
              id="Bounding box"
              width="44"
            />
          </mask>
          <g mask="url(#mask0_1_317)">
            <path
              d={svgPaths.pb48f200}
              fill="var(--fill-0, #1C1B1F)"
              id="location_on"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

function FlagIcon() {
  return (
    <div className={styles.icon} data-name="Icon">
      <svg
        className={styles.iconSvg}
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 44 44"
      >
        <g id="Icon">
          <mask
            height="44"
            id="mask0_1_313"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
            width="44"
            x="0"
            y="0"
          >
            <rect
              fill="var(--fill-0, #D9D9D9)"
              height="44"
              id="Bounding box"
              width="44"
            />
          </mask>
          <g mask="url(#mask0_1_313)">
            <path
              d={svgPaths.p32615cf0}
              fill="var(--fill-0, #1C1B1F)"
              id="flag"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

function ArrowIcon() {
  return (
    <div className={styles.arrowIcon} data-name="arrow_range">
      <svg
        className={styles.iconSvg}
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 40 40"
      >
        <g id="arrow_range">
          <mask
            height="40"
            id="mask0_1_327"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
            width="40"
            x="0"
            y="0"
          >
            <rect
              fill="var(--fill-0, #D9D9D9)"
              height="40"
              id="Bounding box"
              width="40"
            />
          </mask>
          <g mask="url(#mask0_1_327)">
            <path
              d={svgPaths.p3d8ec380}
              fill="var(--fill-0, #1C1B1F)"
              id="arrow_range_2"
            />
          </g>
        </g>
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
}

function RouteInput({ type, placeholder, value, onChange }: RouteInputProps) {
  const bgClass = type === "origin" ? styles.bgOrigin : styles.bgDestination;
  const Icon = type === "origin" ? LocationIcon : FlagIcon;

  return (
    <div
      className={`${styles.routeInput} ${bgClass}`}
      data-name={`${type}PointInput`}
    >
      <Icon />
      <input
        type="text"
        className={styles.inputField}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function RouteInputs() {
  const [originValue, setOriginValue] = useState("");
  const [destinationValue, setDestinationValue] = useState("");

  const handleSwap = () => {
    const temp = originValue;
    setOriginValue(destinationValue);
    setDestinationValue(temp);
  };

  return (
    <div className={styles.container}>
      <RouteInput
        type="origin"
        placeholder="出発するバス停・場所"
        value={originValue}
        onChange={setOriginValue}
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
          <span className={styles.swapText}>切り替え</span>
        </button>
      </div>

      <RouteInput
        type="destination"
        placeholder="行きたいバス停・場所"
        value={destinationValue}
        onChange={setDestinationValue}
      />
    </div>
  );
}
