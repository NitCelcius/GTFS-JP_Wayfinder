interface ErrorStateProps {
  error: string;
  onBack: () => void;
}

export function ErrorState({ error, onBack }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-red-500 mb-4">エラー: {error}</div>
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
