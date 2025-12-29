import type { BusStopSearchResult } from "@/types";

import { BusStopSearchModalContainer } from "./BusStopSearchModalContainer";

interface BusStopSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBusStop: (result: BusStopSearchResult) => void;
  title?: string;
  placeholder?: string;
}

/**
 * BusStopSearchModal - backward compatibility wrapper
 * Provides the old API (onClose, onSelectBusStop) while using the new components internally
 * @deprecated Use BusStopSearchModalContainer with onCanceled/onSelected for new code
 */
export function BusStopSearchModal({
  isOpen,
  onClose,
  onSelectBusStop,
  title,
  placeholder,
}: BusStopSearchModalProps) {
  return (
    <BusStopSearchModalContainer
      isOpen={isOpen}
      onCanceled={onClose}
      onSelected={onSelectBusStop}
      title={title}
      placeholder={placeholder}
    />
  );
}
