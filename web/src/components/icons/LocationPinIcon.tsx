import { MapPin } from "lucide-react";

interface LocationPinIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function LocationPinIcon({
  size = 40,
  color = "currentColor",
  className,
  style,
}: LocationPinIconProps) {
  return (
    <MapPin size={size} className={className} style={{ color, ...style }} />
  );
}
