"use client";

import { QRCodeSVG } from "qrcode.react";

import { useState } from "react";

import styles from "./ShareButton.module.css";

interface ShareButtonProps {
  busStopId: string;
  busStopName?: string;
}

function ShareIcon() {
  return (
    <svg
      className="block size-full"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="block size-full"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export function ShareButton({ busStopId, busStopName }: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || window.location.origin || "";
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
        // User cancelled the share or share failed
        console.error("Share failed:", error);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You could add a toast notification here
      alert("リンクをコピーしました");
    } catch (error) {
      console.error("Copy failed:", error);
      alert("リンクのコピーに失敗しました");
    }
  };

  return (
    <>
      <button
        className={styles.shareButton}
        onClick={handleShareClick}
        aria-label="共有"
      >
        <div className={styles.icon}>
          <ShareIcon />
        </div>
      </button>

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
                <QRCodeSVG
                  value={shareUrl}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
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
