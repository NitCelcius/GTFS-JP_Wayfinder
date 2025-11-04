import { Icon } from "@/components/common/Icon/Icon";

interface FlagIconProps {
  className?: string;
  size?: number;
}

export function FlagIcon({ className = "w-6 h-6", size }: FlagIconProps) {
  return <Icon name="flag-filled" size={size} className={className} />;
}
