import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ShareButton } from "../ShareButton";

describe("ShareButton", () => {
  const mockBusStopId = "test-stop-123";
  const mockBusStopName = "テストバス停";

  beforeEach(() => {
    // Mock environment variable via window.__ENV__ for useEnv hook
    (window as any).__ENV__ = {
      NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
    };
  });

  afterEach(() => {
    // Clean up mock
    delete (window as any).__ENV__;
    jest.restoreAllMocks();
  });

  it("should render the share button", () => {
    render(<ShareButton busStopId={mockBusStopId} />);

    const shareButton = screen.getByRole("button", { name: "共有" });
    expect(shareButton).toBeInTheDocument();
  });

  it("should open modal when share button is clicked", () => {
    render(<ShareButton busStopId={mockBusStopId} />);

    const shareButton = screen.getByRole("button", { name: "共有" });
    fireEvent.click(shareButton);

    expect(screen.getByText("バス停を共有")).toBeInTheDocument();
  });

  it("should close modal when close button is clicked", () => {
    render(<ShareButton busStopId={mockBusStopId} />);

    // Open modal
    const shareButton = screen.getByRole("button", { name: "共有" });
    fireEvent.click(shareButton);

    // Close modal
    const closeButton = screen.getByRole("button", { name: "閉じる" });
    fireEvent.click(closeButton);

    expect(screen.queryByText("バス停を共有")).not.toBeInTheDocument();
  });

  it("should close modal when overlay is clicked", () => {
    render(<ShareButton busStopId={mockBusStopId} />);

    // Open modal
    const shareButton = screen.getByRole("button", { name: "共有" });
    fireEvent.click(shareButton);

    // Click overlay
    const overlay = screen.getByText("バス停を共有").closest("div")
      ?.parentElement?.parentElement;
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(screen.queryByText("バス停を共有")).not.toBeInTheDocument();
  });

  it("should display the correct share URL", () => {
    render(<ShareButton busStopId={mockBusStopId} />);

    const shareButton = screen.getByRole("button", { name: "共有" });
    fireEvent.click(shareButton);

    expect(
      screen.getByText(`http://localhost:3000/bus-stop/${mockBusStopId}`)
    ).toBeInTheDocument();
  });

  it("should call navigator.clipboard.writeText when copy button is clicked", async () => {
    const writeTextMock = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    // Mock window.alert
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<ShareButton busStopId={mockBusStopId} />);

    const shareButton = screen.getByRole("button", { name: "共有" });
    fireEvent.click(shareButton);

    const copyButton = screen.getByText("リンクをコピー");
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(
        `http://localhost:3000/bus-stop/${mockBusStopId}`
      );
    });

    alertMock.mockRestore();
  });

  it("should show native share button if navigator.share is available", () => {
    Object.assign(navigator, {
      share: jest.fn(),
    });

    render(<ShareButton busStopId={mockBusStopId} />);

    const shareButton = screen.getByRole("button", { name: "共有" });
    fireEvent.click(shareButton);

    expect(screen.getByText("共有する")).toBeInTheDocument();
  });

  it("should call navigator.share when native share button is clicked", async () => {
    const shareMock = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      share: shareMock,
    });

    render(
      <ShareButton busStopId={mockBusStopId} busStopName={mockBusStopName} />
    );

    const shareButton = screen.getByRole("button", { name: "共有" });
    fireEvent.click(shareButton);

    const nativeShareButton = screen.getByText("共有する");
    fireEvent.click(nativeShareButton);

    await waitFor(() => {
      expect(shareMock).toHaveBeenCalledWith({
        title: `${mockBusStopName} - バス停情報`,
        text: `${mockBusStopName} - バス停情報を共有`,
        url: `http://localhost:3000/bus-stop/${mockBusStopId}`,
      });
    });
  });

  it("should handle copy failure gracefully", async () => {
    const writeTextMock = jest.fn().mockRejectedValue(new Error("Copy failed"));
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<ShareButton busStopId={mockBusStopId} />);

    const shareButton = screen.getByRole("button", { name: "共有" });
    fireEvent.click(shareButton);

    const copyButton = screen.getByText("リンクをコピー");
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("リンクのコピーに失敗しました");
    });

    alertMock.mockRestore();
  });
});
