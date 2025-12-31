import { MapPin } from "lucide-react";

interface LocationIconProps {
  size?: number;
}

export function LocationIcon({ size = 24 }: LocationIconProps) {
  return <MapPin size={size} fill="currentColor" />;
}
