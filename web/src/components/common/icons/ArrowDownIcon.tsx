import { Icon } from "@/components/common";

interface ArrowDownIconProps {
  size?: number;
}

export function ArrowDownIcon({ size = 24 }: ArrowDownIconProps) {
  return <Icon name="arrow-down" size={size} />;
}
