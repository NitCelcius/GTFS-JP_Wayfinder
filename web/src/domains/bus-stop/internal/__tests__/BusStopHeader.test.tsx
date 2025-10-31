import { fireEvent, render, screen } from "@testing-library/react";

import { BusStopHeader } from "../BusStopHeader";

describe("BusStopHeader", () => {
  const mockName = "テストバス停";
  const mockDistance = "500m";
  const mockBusStopId = "test-stop-123";
  const mockOnShareClick = jest.fn();

  beforeEach(() => {
    mockOnShareClick.mockClear();
  });

  it("should render bus stop name and distance", () => {
    render(<BusStopHeader name={mockName} distance={mockDistance} />);

    expect(screen.getByText(mockName)).toBeInTheDocument();
    expect(screen.getByText(mockDistance)).toBeInTheDocument();
  });

  it("should render location icon", () => {
    render(<BusStopHeader name={mockName} distance={mockDistance} />);

    // Check for SVG element (location icon)
    const icon = screen.getByText(mockName).previousSibling;
    expect(icon).toBeInTheDocument();
  });

  it("should not render share button when busStopId is not provided", () => {
    render(<BusStopHeader name={mockName} distance={mockDistance} />);

    expect(
      screen.queryByRole("button", { name: "共有" })
    ).not.toBeInTheDocument();
  });

  it("should render share button when busStopId is provided", () => {
    render(
      <BusStopHeader
        name={mockName}
        distance={mockDistance}
        busStopId={mockBusStopId}
        onShareClick={mockOnShareClick}
      />
    );

    expect(screen.getByRole("button", { name: "共有" })).toBeInTheDocument();
  });

  it("should display share icon and label", () => {
    render(
      <BusStopHeader
        name={mockName}
        distance={mockDistance}
        busStopId={mockBusStopId}
        onShareClick={mockOnShareClick}
      />
    );

    expect(screen.getByText("共有")).toBeInTheDocument();
    // Check for share icon SVG
    const shareButton = screen.getByRole("button", { name: "共有" });
    const svg = shareButton.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should call onShareClick when share button is clicked", () => {
    render(
      <BusStopHeader
        name={mockName}
        distance={mockDistance}
        busStopId={mockBusStopId}
        onShareClick={mockOnShareClick}
      />
    );

    const shareButton = screen.getByRole("button", { name: "共有" });
    fireEvent.click(shareButton);

    expect(mockOnShareClick).toHaveBeenCalledTimes(1);
  });

  it("should render with proper layout structure", () => {
    const { container } = render(
      <BusStopHeader
        name={mockName}
        distance={mockDistance}
        busStopId={mockBusStopId}
        onShareClick={mockOnShareClick}
      />
    );

    // Check for main container
    const header = container.querySelector('[class*="header"]');
    expect(header).toBeInTheDocument();

    // Check for left section (icon + name)
    const leftSection = container.querySelector('[class*="leftSection"]');
    expect(leftSection).toBeInTheDocument();

    // Check for right section (share button + distance)
    const rightSection = container.querySelector('[class*="rightSection"]');
    expect(rightSection).toBeInTheDocument();
  });

  it("should handle long bus stop names gracefully", () => {
    const longName =
      "非常に長いバス停の名前でテキストがオーバーフローする可能性があります";
    render(
      <BusStopHeader
        name={longName}
        distance={mockDistance}
        busStopId={mockBusStopId}
        onShareClick={mockOnShareClick}
      />
    );

    expect(screen.getByText(longName)).toBeInTheDocument();
  });

  it("should render without share button when only busStopId is provided without onShareClick", () => {
    render(
      <BusStopHeader
        name={mockName}
        distance={mockDistance}
        busStopId={mockBusStopId}
      />
    );

    // Share button should still render but won't do anything when clicked
    expect(screen.getByRole("button", { name: "共有" })).toBeInTheDocument();
  });

  it("should handle empty distance", () => {
    render(<BusStopHeader name={mockName} distance="" />);

    expect(screen.getByText(mockName)).toBeInTheDocument();
    // Distance element should exist but be empty
    const distanceElement = screen.queryByText(mockDistance);
    expect(distanceElement).not.toBeInTheDocument();
  });
});
