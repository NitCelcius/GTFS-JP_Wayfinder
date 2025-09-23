import svgPaths from "@/app/imports/svg-uqfc70duf5";

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
      <svg
        className={STYLES.iconSvg}
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 44 44"
      >
        <mask
          id="mask_loc"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
          x="0"
          y="0"
          width="44"
          height="44"
        >
          <rect fill="#D9D9D9" width="44" height="44" />
        </mask>
        <g mask="url(#mask_loc)">
          <path d={svgPaths.pb48f200} fill="#1C1B1F" />
        </g>
      </svg>
    </div>
  );
}

function FlagIcon() {
  return (
    <div className={STYLES.icon}>
      <svg
        className={STYLES.iconSvg}
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 44 44"
      >
        <mask
          id="mask_flag"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
          x="0"
          y="0"
          width="44"
          height="44"
        >
          <rect fill="#D9D9D9" width="44" height="44" />
        </mask>
        <g mask="url(#mask_flag)">
          <path d={svgPaths.p32615cf0} fill="#1C1B1F" />
        </g>
      </svg>
    </div>
  );
}

function ArrowIcon() {
  return (
    <div className={STYLES.arrowIcon}>
      <svg
        className={STYLES.iconSvg}
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 40 40"
      >
        <mask
          id="mask_arrow"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
          x="0"
          y="0"
          width="40"
          height="40"
        >
          <rect fill="#D9D9D9" width="40" height="40" />
        </mask>
        <g mask="url(#mask_arrow)">
          <path d={svgPaths.p3d8ec380} fill="#1C1B1F" />
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
  const bgClass =
    type === "origin"
      ? INPUT_BACKGROUNDS.origin
      : INPUT_BACKGROUNDS.destination;
  const Icon = type === "origin" ? LocationIcon : FlagIcon;
  return (
    <div className={`${STYLES.routeInput} ${bgClass}`}>
      <Icon />
      <input
        type="text"
        className={STYLES.inputField}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

interface RouteInputsProps {
  originValue: string;
  destinationValue: string;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
}

export function RouteInputs({
  originValue,
  destinationValue,
  onOriginChange,
  onDestinationChange,
}: RouteInputsProps) {
  const handleSwap = () => {
    onOriginChange(destinationValue);
    onDestinationChange(originValue);
  };

  return (
    <div className={STYLES.container}>
      <RouteInput
        type="origin"
        placeholder="出発するバス停・場所"
        value={originValue}
        onChange={onOriginChange}
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
          <span className={STYLES.swapText}>切り替え</span>
        </button>
      </div>
      <RouteInput
        type="destination"
        placeholder="行きたいバス停・場所"
        value={destinationValue}
        onChange={onDestinationChange}
      />
    </div>
  );
}
