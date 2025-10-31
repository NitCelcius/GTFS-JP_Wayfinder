import { render, screen, fireEvent } from "@testing-library/react";

import { ErrorDialog } from "../ErrorDialog";

describe("ErrorDialog", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up body overflow style
    document.body.style.overflow = "unset";
  });

  it("should render when isOpen is true", () => {
    render(<ErrorDialog isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByRole("dialog", { name: /エラーが発生しました/i })
    ).toBeInTheDocument();
    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
  });

  it("should not render when isOpen is false", () => {
    render(<ErrorDialog isOpen={false} onClose={mockOnClose} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should render custom title and message", () => {
    render(
      <ErrorDialog
        isOpen={true}
        onClose={mockOnClose}
        title="カスタムタイトル"
        message="カスタムメッセージ"
      />
    );

    expect(screen.getByText("カスタムタイトル")).toBeInTheDocument();
    expect(screen.getByText("カスタムメッセージ")).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", () => {
    render(<ErrorDialog isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText("閉じる");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when overlay is clicked", () => {
    render(<ErrorDialog isOpen={true} onClose={mockOnClose} />);

    const overlay = screen.getByRole("dialog");
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when Escape key is pressed", () => {
    render(<ErrorDialog isOpen={true} onClose={mockOnClose} />);

    const overlay = screen.getByRole("dialog");
    fireEvent.keyDown(overlay, { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should navigate to home when Go Home button is clicked", () => {
    // Spy on window.location.href assignment
    const originalLocation = window.location;
    const mockAssign = jest.fn();

    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        href: originalLocation.href,
      },
      writable: true,
      configurable: true,
    });

    // Spy on href setter
    const hrefSpy = jest.fn();
    Object.defineProperty(window.location, "href", {
      set: hrefSpy,
      get: () => originalLocation.href,
      configurable: true,
    });

    render(<ErrorDialog isOpen={true} onClose={mockOnClose} />);

    const homeButton = screen.getByText("ホームに戻る");
    fireEvent.click(homeButton);

    expect(hrefSpy).toHaveBeenCalledWith("/");

    // Restore
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it("should open mailto link when Report Problem button is clicked", () => {
    // Spy on window.location.href assignment
    const originalLocation = window.location;

    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        href: originalLocation.href,
      },
      writable: true,
      configurable: true,
    });

    // Spy on href setter
    const hrefSpy = jest.fn();
    Object.defineProperty(window.location, "href", {
      set: hrefSpy,
      get: () => originalLocation.href,
      configurable: true,
    });

    render(
      <ErrorDialog
        isOpen={true}
        onClose={mockOnClose}
        contactEmail="test@example.com"
      />
    );

    const reportButton = screen.getByText("この問題を報告する");
    fireEvent.click(reportButton);

    expect(hrefSpy).toHaveBeenCalledTimes(1);
    const mailtoUrl = hrefSpy.mock.calls[0][0];
    expect(mailtoUrl).toContain("mailto:test@example.com");
    expect(mailtoUrl).toContain("subject=");

    // Restore
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it("should use default email if contactEmail is not provided", () => {
    // Spy on window.location.href assignment
    const originalLocation = window.location;

    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        href: originalLocation.href,
      },
      writable: true,
      configurable: true,
    });

    // Spy on href setter
    const hrefSpy = jest.fn();
    Object.defineProperty(window.location, "href", {
      set: hrefSpy,
      get: () => originalLocation.href,
      configurable: true,
    });

    render(<ErrorDialog isOpen={true} onClose={mockOnClose} />);

    const reportButton = screen.getByText("この問題を報告する");
    fireEvent.click(reportButton);

    expect(hrefSpy).toHaveBeenCalledTimes(1);
    const mailtoUrl = hrefSpy.mock.calls[0][0];
    expect(mailtoUrl).toContain("mailto:support@example.com");

    // Restore
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it("should show error details in development mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const testError = new Error("Test error message");
    testError.stack = "Test stack trace";

    render(
      <ErrorDialog
        isOpen={true}
        onClose={mockOnClose}
        error={testError}
      />
    );

    expect(screen.getByText("エラーの詳細を表示")).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it("should not show error details in production mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const testError = new Error("Test error message");

    render(
      <ErrorDialog
        isOpen={true}
        onClose={mockOnClose}
        error={testError}
      />
    );

    expect(screen.queryByText("エラーの詳細を表示")).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it("should prevent body scroll when modal is open", () => {
    const { rerender } = render(
      <ErrorDialog isOpen={true} onClose={mockOnClose} />
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender(<ErrorDialog isOpen={false} onClose={mockOnClose} />);

    expect(document.body.style.overflow).toBe("unset");
  });
});
