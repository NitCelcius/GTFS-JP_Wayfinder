import { MapPinned } from "lucide-react";

interface MapSearchIconProps {
  size?: number;
}

export function MapSearchIcon({ size = 24 }: MapSearchIconProps) {
  return <MapPinned size={size} />;
}
