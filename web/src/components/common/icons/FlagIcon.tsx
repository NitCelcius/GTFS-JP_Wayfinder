import { Flag } from "lucide-react";

interface FlagIconProps {
  size?: number;
}

export function FlagIcon({ size = 24 }: FlagIconProps) {
  return <Flag size={size} fill="currentColor" />;
}
