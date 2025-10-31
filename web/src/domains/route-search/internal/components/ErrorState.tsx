import { useState } from "react";

import { ErrorDialog } from "@/components/common";

interface ErrorStateProps {
  error: string;
  onBack: () => void;
}

export function ErrorState({ error, onBack }: ErrorStateProps) {
  const [isOpen, setIsOpen] = useState(true);
  const contactEmail = process.env.NEXT_ERROR_CONTACT_EMAIL;

  const handleClose = () => {
    setIsOpen(false);
    onBack();
  };

  return (
    <ErrorDialog
      isOpen={isOpen}
      onClose={handleClose}
      title="エラーが発生しました"
      message={error}
      contactEmail={contactEmail}
    />
  );
}
