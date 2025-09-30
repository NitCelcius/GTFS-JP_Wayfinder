interface NoRoutesFoundStateProps {
  onBack: () => void;
}

export function NoRoutesFoundState({ onBack }: NoRoutesFoundStateProps) {
  return (
    <div>
      <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700 mb-4">
        <p className="font-semibold mb-2">❌ 経路が見つかりません</p>
        <p>選択したバス停間で指定時間に運行する経路が見つかりませんでした。</p>
        <p className="mt-2">以下の原因が考えられます：</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>バス停IDがGTFSデータに存在しない</li>
          <li>これらのバス停間に運行経路がない</li>
          <li>指定時間に運行サービスがない</li>
        </ul>
      </div>

      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">検索準備完了</h2>
          <p className="text-gray-600 mb-4">
            経路検索を実行してリアルタイムのバス経路を確認しましょう
          </p>
          <button
            onClick={onBack}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            🚌 経路検索を開始
          </button>
        </div>
      </div>
    </div>
  );
}
