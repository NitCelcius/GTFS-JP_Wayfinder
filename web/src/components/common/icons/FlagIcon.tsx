import { Icon } from "@/components/common";

interface FlagIconProps {
  size?: number;
}

export function FlagIcon({ size = 24 }: FlagIconProps) {
  return <Icon name="flag-filled" size={size} />;
}
