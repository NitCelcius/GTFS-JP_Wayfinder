import { Icon } from "@/components/common";

interface DeparturePinIconProps {
  size?: number;
  className?: string;
}

/**
 * Departure pin icon.
 * Used to mark the starting point in route visualizations.
 */
export function DeparturePinIcon({
  size = 24,
  className,
}: DeparturePinIconProps) {
  return <Icon name="location-filled" size={size} className={className} />;
}
