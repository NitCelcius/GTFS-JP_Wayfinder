import { Icon } from "@/components/common";

interface LocationIconProps {
  size?: number;
}

export function LocationIcon({ size = 24 }: LocationIconProps) {
  return <Icon name="location-filled" size={size} />;
}
