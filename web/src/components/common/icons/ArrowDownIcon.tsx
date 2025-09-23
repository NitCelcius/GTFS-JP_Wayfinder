interface ArrowDownIconProps {
  className?: string;
  size?: number;
}

export function ArrowDownIcon({
  className = "w-6 h-6",
  size,
}: ArrowDownIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7 10l5 5 5-5z" fill="currentColor" />
    </svg>
  );
}
