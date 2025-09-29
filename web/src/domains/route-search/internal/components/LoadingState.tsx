export function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <div className="text-lg font-medium mb-2">
          🚌 経路を検索しています...
        </div>
        <div className="text-sm text-gray-600">
          リアルタイムバス情報を取得中
        </div>
      </div>
    </div>
  );
}
