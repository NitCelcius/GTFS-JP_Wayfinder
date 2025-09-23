interface FlagIconProps {
  className?: string;
  size?: number;
}

export function FlagIcon({ className = "w-6 h-6", size }: FlagIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" fill="currentColor" />
    </svg>
  );
}
