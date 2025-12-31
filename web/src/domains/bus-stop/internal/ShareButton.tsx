"use client";

import { Share2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { useState } from "react";

import { useEnvValue } from "@/hooks";

import styles from "./ShareButton.module.css";

interface ShareButtonProps {
  busStopId: string;
  busStopName?: string;
}

function ShareIcon() {
  return <Share2 size={24} aria-hidden="true" />;
}

function CloseIcon() {
  return <X size={24} aria-hidden="true" />;
}

export function ShareButton({ busStopId, busStopName }: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const baseUrl = useEnvValue("NEXT_PUBLIC_BASE_URL") || "";
  const shareUrl = `${baseUrl}/bus-stop/${busStopId}`;
  const shareTitle = busStopName ? `${busStopName} - バス停情報` : "バス停情報";

  const handleShareClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `${shareTitle}を共有`,
          url: shareUrl,
        });
        setShowModal(false);
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
      await navigator.clipboard.writeText(shareUrl);
      // TODO: Replace with toast notification system
      alert("リンクをコピーしました");
    } catch (error) {
      console.error("Copy failed:", error);
      // TODO: Replace with toast notification system
      alert("リンクのコピーに失敗しました");
    }
  };

  return (
    <>
      <div className={styles.shareButtonContainer}>
        <button
          className={styles.shareButton}
          onClick={handleShareClick}
          aria-label="共有"
        >
          <div className={styles.icon}>
            <ShareIcon />
          </div>
        </button>
        <span className={styles.shareLabel}>共有</span>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>バス停を共有</h2>
              <button
                className={styles.closeButton}
                onClick={handleCloseModal}
                aria-label="閉じる"
              >
                <CloseIcon />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.qrCodeContainer}>
                <div className={styles.qrCodeWrapper}>
                  <QRCodeSVG
                    value={shareUrl}
                    size={400}
                    level="M"
                    includeMargin={false}
                  />
                </div>
              </div>

              <p className={styles.urlText}>{shareUrl}</p>

              <div className={styles.buttonGroup}>
                <button
                  className={styles.actionButton}
                  onClick={handleCopyLink}
                >
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
      )}
    </>
  );
}
