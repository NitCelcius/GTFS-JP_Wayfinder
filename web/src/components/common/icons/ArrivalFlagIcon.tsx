import { Icon } from "@/components/common";

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
  return <Icon name="flag-filled" size={size} className={className} />;
}
