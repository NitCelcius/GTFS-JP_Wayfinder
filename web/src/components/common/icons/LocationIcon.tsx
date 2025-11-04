import { Icon } from "@/components/common/Icon/Icon";

interface LocationIconProps {
  className?: string;
  size?: number;
}

export function LocationIcon({
  className = "w-6 h-6",
  size,
}: LocationIconProps) {
  return <Icon name="location-filled" size={size} className={className} />;
}
