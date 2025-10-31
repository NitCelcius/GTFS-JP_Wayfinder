import { render, screen, fireEvent } from "@testing-library/react";

import { ErrorBoundary } from "../ErrorBoundary";

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>Normal content</div>;
}

describe("ErrorBoundary", () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Suppress console.error during tests to avoid noise
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Normal content")).toBeInTheDocument();
  });

  it("should render ErrorDialog when an error is thrown", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText("Normal content")).not.toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
  });

  it("should pass contactEmail to ErrorDialog", () => {
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
      <ErrorBoundary contactEmail="custom@example.com">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reportButton = screen.getByText("この問題を報告する");
    fireEvent.click(reportButton);

    expect(hrefSpy).toHaveBeenCalledTimes(1);
    const mailtoUrl = hrefSpy.mock.calls[0][0];
    expect(mailtoUrl).toContain("mailto:custom@example.com");

    // Restore
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it("should log error to console when error is caught", () => {
    const consoleErrorSpy = jest.spyOn(console, "error");

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
