import { ArrowDown } from "lucide-react";

interface ArrowDownIconProps {
  size?: number;
}

export function ArrowDownIcon({ size = 24 }: ArrowDownIconProps) {
  return <ArrowDown size={size} />;
}
