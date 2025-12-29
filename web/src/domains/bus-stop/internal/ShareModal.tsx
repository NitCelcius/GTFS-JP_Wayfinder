"use client";

import { QRCodeSVG } from "qrcode.react";

import { Icon } from "@/components/common";
import { useEnvValue } from "@/hooks";

import styles from "./ShareModal.module.css";

interface ShareModalProps {
  shareUrl: string; // Full URL to share (e.g., "https://example.com/bus-stop/123" or "/results?...")
  title?: string; // Optional title for the share modal
  isOpen: boolean;
  onClose: () => void;
}

function CloseIcon() {
  return <Icon name="close" size={24} aria-hidden="true" />;
}

export function ShareModal({
  shareUrl,
  title,
  isOpen,
  onClose,
}: ShareModalProps) {
  const baseUrl = useEnvValue("NEXT_PUBLIC_BASE_URL") || "";

  // If shareUrl is a relative path, prepend the base URL
  const fullShareUrl = shareUrl.startsWith("http")
    ? shareUrl
    : `${baseUrl}${shareUrl.startsWith("/") ? shareUrl : `/${shareUrl}`}`;

  const shareTitle = title || "バス停情報";

  if (!isOpen) return null;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `${shareTitle}を共有`,
          url: fullShareUrl,
        });
        onClose();
      } catch (error) {
        // Check if user cancelled the share
        if (error instanceof Error && error.name === "AbortError") {
          console.info("Share cancelled by user");
        } else {
          // Other errors should be thrown
          console.error("Share failed:", error);
          throw error;
        }
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullShareUrl);
      // TODO: Replace with toast notification system
      alert("リンクをコピーしました");
    } catch (error) {
      console.error("Copy failed:", error);
      // TODO: Replace with toast notification system
      alert("リンクのコピーに失敗しました");
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>バス停を共有</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="閉じる"
          >
            <CloseIcon />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.qrCodeContainer}>
            <div className={styles.qrCodeWrapper}>
              <QRCodeSVG
                value={fullShareUrl}
                size={400}
                level="M"
                includeMargin={false}
                className={styles.qrCode}
              />
            </div>
          </div>

          <p className={styles.urlText}>{fullShareUrl}</p>

          <div className={styles.buttonGroup}>
            <button className={styles.actionButton} onClick={handleCopyLink}>
              リンクをコピー
            </button>

            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                className={styles.actionButton}
                onClick={handleNativeShare}
              >
                共有する
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
