import { ArrowRight } from "lucide-react";

interface ArrowRightIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ArrowRightIcon({
  size = 32,
  color = "currentColor",
  className,
  style,
}: ArrowRightIconProps) {
  return (
    <ArrowRight size={size} className={className} style={{ color, ...style }} />
  );
}
