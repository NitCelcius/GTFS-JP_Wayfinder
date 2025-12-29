"use client";

import { useEffect } from "react";

import { ErrorBoundary } from "@/components/common";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorBoundary message="検索結果の読み込みに失敗しました" />;
}
