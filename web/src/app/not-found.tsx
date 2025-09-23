export default function NotFound() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold">ページが見つかりません</h1>
      <p className="text-sm text-gray-600">
        指定されたページは存在しないか、移動されました。
      </p>
    </div>
  );
}
