import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ShareModal } from "../ShareModal";

describe("ShareModal with URL paths", () => {
  const mockSearchUrl = "/results?search=true&from=1021_01&to=3109_01";
  const mockSearchTitle = "中央公園 から 緑が丘 までの検索結果";
  const mockOnClose = jest.fn();

  beforeEach(() => {
    // Mock environment variable via window.__ENV__ for useEnv hook
    (window as Window & { __ENV__?: Record<string, string | undefined> }).__ENV__ = {
      NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
    };
    mockOnClose.mockClear();
  });

  afterEach(() => {
    // Clean up mock
    delete (window as Window & { __ENV__?: Record<string, string | undefined> }).__ENV__;
    jest.restoreAllMocks();
  });

  it("should handle URL paths correctly", () => {
    render(
      <ShareModal
        shareUrl={mockSearchUrl}
        title={mockSearchTitle}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const expectedUrl = `http://localhost:3000${mockSearchUrl}`;
    expect(screen.getByText(expectedUrl)).toBeInTheDocument();
  });

  it("should share URL path correctly with navigator.share", async () => {
    const mockShare = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      share: mockShare,
    });

    render(
      <ShareModal
        shareUrl={mockSearchUrl}
        title={mockSearchTitle}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const shareButton = screen.getByText("共有する");
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: mockSearchTitle,
        text: `${mockSearchTitle}を共有`,
        url: `http://localhost:3000${mockSearchUrl}`,
      });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should copy URL path to clipboard correctly", async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <ShareModal
        shareUrl={mockSearchUrl}
        title={mockSearchTitle}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const copyButton = screen.getByText("リンクをコピー");
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        `http://localhost:3000${mockSearchUrl}`
      );
      expect(alertMock).toHaveBeenCalledWith("リンクをコピーしました");
    });

    alertMock.mockRestore();
  });

  it("should work with absolute URLs", () => {
    const absoluteUrl = "http://localhost:3000/bus-stop/test-stop-123";

    render(
      <ShareModal
        shareUrl={absoluteUrl}
        title="テストバス停"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(absoluteUrl)).toBeInTheDocument();
  });
});
