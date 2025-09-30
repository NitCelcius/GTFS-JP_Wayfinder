interface EmptyStateProps {
  onBack: () => void;
}

export function EmptyState({ onBack }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="mb-4">検索結果がありません</div>
        <button
          onClick={onBack}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          検索に戻る
        </button>
      </div>
    </div>
  );
}
