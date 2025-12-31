import { Flag } from "lucide-react";

interface ArrivalFlagIconProps {
  size?: number;
  className?: string;
}

/**
 * Arrival flag icon.
 * Used to mark the destination point in route visualizations.
 */
export function ArrivalFlagIcon({
  size = 24,
  className,
}: ArrivalFlagIconProps) {
  return <Flag size={size} className={className} fill="currentColor" />;
}
