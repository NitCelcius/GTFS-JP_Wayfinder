import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible, message = "読み込み中..." }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[var(--radius-lg)] p-[var(--size-spacing-2xl)] flex flex-col items-center gap-[var(--size-spacing-lg)] shadow-lg">
        <LoadingSpinner size="lg" />
        <span className="text-[1rem]">{message}</span>
      </div>
    </div>
  );
}