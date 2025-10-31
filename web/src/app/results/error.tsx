"use client";

import { useEffect, useState } from "react";

import { ErrorDialog } from "@/components/common";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const contactEmail = process.env.NEXT_ERROR_CONTACT_EMAIL;

  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  return (
    <ErrorDialog
      isOpen={isOpen}
      onClose={handleClose}
      title="エラーが発生しました"
      message="検索結果の読み込み中にエラーが発生しました。"
      error={error}
      contactEmail={contactEmail}
    />
  );
}
