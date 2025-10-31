import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ShareModal } from "../ShareModal";

describe("ShareModal", () => {
  const mockShareUrl = "/bus-stop/test-stop-123";
  const mockTitle = "テストバス停 - バス停情報";
  const mockOnClose = jest.fn();

  beforeEach(() => {
    // Mock environment variable
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
    mockOnClose.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should not render when isOpen is false", () => {
    render(
      <ShareModal
        shareUrl={mockShareUrl}
        title={mockTitle}
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText("バス停を共有")).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    render(
      <ShareModal
        shareUrl={mockShareUrl}
        title={mockTitle}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("バス停を共有")).toBeInTheDocument();
  });

  it("should display the QR code when modal is open", () => {
    render(
      <ShareModal
        shareUrl={mockShareUrl}
        title={mockTitle}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // QRCodeSVG should be rendered (check for svg element)
    const qrCode = document.querySelector("svg");
    expect(qrCode).toBeInTheDocument();
  });

  it("should display the share URL", () => {
    render(
      <ShareModal
        shareUrl={mockShareUrl}
        title={mockTitle}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const expectedUrl = `http://localhost:3000/bus-stop/test-stop-123`;
    expect(screen.getByText(expectedUrl)).toBeInTheDocument();
  });

  it("should call onClose when clicking the close button", () => {
    render(
      <ShareModal
        shareUrl={mockShareUrl}
        title={mockTitle}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText("閉じる");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when clicking the backdrop", () => {
    render(
      <ShareModal
        shareUrl={mockShareUrl}
        title={mockTitle}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Get the modal overlay (backdrop) - it's the parent div that has the onClick handler
    const backdrop = screen.getByText("バス停を共有").closest("div")
      ?.parentElement?.parentElement;

    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it("should call onClose when overlay is clicked", () => {
    render(
      <ShareModal
        shareUrl={mockShareUrl}
        title={mockTitle}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const overlay = screen.getByText("バス停を共有").closest("div")
      ?.parentElement?.parentElement;
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it("should not call onClose when modal content is clicked", () => {
    render(
      <ShareModal
        shareUrl={mockShareUrl}
        title={mockTitle}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const modalContent = screen.getByText("バス停を共有").closest("div");
    if (modalContent) {
      fireEvent.click(modalContent);
      expect(mockOnClose).not.toHaveBeenCalled();
    }
  });

  it("should copy link to clipboard when copy button is clicked", async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    // Mock window.alert
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <ShareModal
        shareUrl={mockShareUrl}
        title={mockTitle}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const copyButton = screen.getByText("リンクをコピー");
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        `http://localhost:3000/bus-stop/test-stop-123`
      );
      expect(alertMock).toHaveBeenCalledWith("リンクをコピーしました");
    });

    alertMock.mockRestore();
  });

  it("should handle copy error gracefully", async () => {
    const mockWriteText = jest.fn().mockRejectedValue(new Error("Copy failed"));
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    // Mock window.alert and console.error
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
    const consoleErrorMock = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <ShareModal
        shareUrl={mockShareUrl}
        title={mockTitle}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const copyButton = screen.getByText("リンクをコピー");
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalled();
      expect(alertMock).toHaveBeenCalledWith("リンクのコピーに失敗しました");
    });

    alertMock.mockRestore();
    consoleErrorMock.mockRestore();
  });

  it("should show native share button when navigator.share is available", () => {
    Object.assign(navigator, {
      share: jest.fn(),
    });

    render(
      <ShareModal
        shareUrl={mockShareUrl}
        title={mockTitle}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("共有する")).toBeInTheDocument();
  });

  it("should call navigator.share when share button is clicked", async () => {
    const mockShare = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      share: mockShare,
    });

    render(
      <ShareModal
        shareUrl={mockShareUrl}
        title={mockTitle}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const shareButton = screen.getByText("共有する");
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: mockTitle,
        text: `${mockTitle}を共有`,
        url: `http://localhost:3000/bus-stop/test-stop-123`,
      });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should handle share cancellation gracefully", async () => {
    const abortError = new Error("User cancelled");
    abortError.name = "AbortError";
    const mockShare = jest.fn().mockRejectedValue(abortError);
    Object.assign(navigator, {
      share: mockShare,
    });

    const consoleInfoMock = jest
      .spyOn(console, "info")
      .mockImplementation(() => {});

    render(
      <ShareModal
        shareUrl={mockShareUrl}
        title={mockTitle}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const shareButton = screen.getByText("共有する");
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(consoleInfoMock).toHaveBeenCalledWith("Share cancelled by user");
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    consoleInfoMock.mockRestore();
  });

  it("should use fallback title when title is not provided", () => {
    render(
      <ShareModal shareUrl={mockShareUrl} isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByText("バス停を共有")).toBeInTheDocument();
  });
});
