import { Icon } from "@/components/common/Icon/Icon";

interface ArrowDownIconProps {
  className?: string;
  size?: number;
}

export function ArrowDownIcon({
  className = "w-6 h-6",
  size,
}: ArrowDownIconProps) {
  return <Icon name="arrow-down" size={size} className={className} />;
}
