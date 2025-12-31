import { MapPin } from "lucide-react";

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
  return <MapPin size={size} className={className} fill="currentColor" />;
}
