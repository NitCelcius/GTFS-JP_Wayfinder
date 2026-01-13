import { fireEvent, render, screen } from "@testing-library/react";

import { BusStopInfoV2 } from "../BusStopInfoV2";
import type { UpcomingBusInfo } from "../BusStopInfoV2";

describe("BusStopInfoV2 - Walk Directions Button Visibility", () => {
  const props = {
    busStopName: "テストバス停",
    upcomingBuses: [],
  };

  it("should show walk directions button when coordinates are valid and callback is provided", () => {
    render(
      <BusStopInfoV2
        {...props}
        hasValidCoordinates={true}
        onWalkDirections={() => {}}
      />
    );

    expect(screen.getByLabelText("Get walk directions")).toBeInTheDocument();
  });

  it("should hide walk directions button when coordinates are invalid", () => {
    render(
      <BusStopInfoV2
        {...props}
        hasValidCoordinates={false}
        onWalkDirections={() => {}}
      />
    );

    expect(
      screen.queryByLabelText("Get walk directions")
    ).not.toBeInTheDocument();
  });

  it("should hide walk directions button when callback is undefined", () => {
    render(<BusStopInfoV2 {...props} hasValidCoordinates={true} />);

    expect(
      screen.queryByLabelText("Get walk directions")
    ).not.toBeInTheDocument();
  });

  it("should show other action buttons regardless of walk directions visibility", () => {
    render(<BusStopInfoV2 {...props} hasValidCoordinates={false} />);

    expect(screen.getByLabelText("Search destinations")).toBeInTheDocument();
    // TODO: temporarily removed transfer button for demonstration version
    // expect(screen.getByLabelText("Transfer options")).toBeInTheDocument();
    expect(screen.getByLabelText("View route list")).toBeInTheDocument();
  });
});

describe("BusStopInfoV2 - ShareModal Integration", () => {
  const mockBusStopId = "test-stop-123";
  const mockBusStopName = "中央公園";
  const props = {
    busStopId: mockBusStopId,
    busStopName: mockBusStopName,
    upcomingBuses: [],
  };

  it("should render the Share button in the action button bar", () => {
    render(<BusStopInfoV2 {...props} />);

    const shareButton = screen.getByLabelText("Share bus stop");
    expect(shareButton).toBeInTheDocument();
    expect(shareButton).toHaveTextContent("共有");
  });

  it("should not render ShareModal initially (closed state)", () => {
    render(<BusStopInfoV2 {...props} />);

    // Modal should not be visible initially
    expect(
      screen.queryByText(`${mockBusStopName} - バス停情報`)
    ).not.toBeInTheDocument();
  });

  it("should open ShareModal when Share button is clicked", () => {
    render(<BusStopInfoV2 {...props} />);

    const shareButton = screen.getByLabelText("Share bus stop");
    fireEvent.click(shareButton);

    // Modal should now be visible with correct title
    expect(
      screen.getByText(`${mockBusStopName} - バス停情報`)
    ).toBeInTheDocument();
  });

  it("should pass correct props to ShareModal", () => {
    render(<BusStopInfoV2 {...props} />);

    const shareButton = screen.getByLabelText("Share bus stop");
    fireEvent.click(shareButton);

    // Check that modal has correct title
    expect(
      screen.getByText(`${mockBusStopName} - バス停情報`)
    ).toBeInTheDocument();

    // Check that URL is constructed correctly (it will be in the modal)
    // The QR code and URL text will contain the bus stop ID
    expect(screen.getByText(/\/bus-stop\/test-stop-123/)).toBeInTheDocument();
  });

  it("should close ShareModal when close button is clicked", () => {
    render(<BusStopInfoV2 {...props} />);

    // Open modal
    const shareButton = screen.getByLabelText("Share bus stop");
    fireEvent.click(shareButton);
    expect(
      screen.getByText(`${mockBusStopName} - バス停情報`)
    ).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByLabelText("閉じる");
    fireEvent.click(closeButton);

    // Modal should be gone
    expect(
      screen.queryByText(`${mockBusStopName} - バス停情報`)
    ).not.toBeInTheDocument();
  });

  it("should not render ShareModal when busStopId is undefined", () => {
    const propsWithoutId = {
      busStopName: mockBusStopName,
      upcomingBuses: [],
    };

    render(<BusStopInfoV2 {...propsWithoutId} />);

    // Share button should still exist
    const shareButton = screen.getByLabelText("Share bus stop");
    fireEvent.click(shareButton);

    // But modal should not render without busStopId
    expect(
      screen.queryByText(`${mockBusStopName} - バス停情報`)
    ).not.toBeInTheDocument();
  });

  it("should toggle ShareModal state correctly on multiple open/close cycles", () => {
    render(<BusStopInfoV2 {...props} />);

    const shareButton = screen.getByLabelText("Share bus stop");

    // First open
    fireEvent.click(shareButton);
    expect(
      screen.getByText(`${mockBusStopName} - バス停情報`)
    ).toBeInTheDocument();

    // Close
    fireEvent.click(screen.getByLabelText("閉じる"));
    expect(
      screen.queryByText(`${mockBusStopName} - バス停情報`)
    ).not.toBeInTheDocument();

    // Second open
    fireEvent.click(shareButton);
    expect(
      screen.getByText(`${mockBusStopName} - バス停情報`)
    ).toBeInTheDocument();
  });
});

describe("BusStopInfoV2 - Past Bus Display", () => {
  const upcomingBuses: UpcomingBusInfo[] = [
    {
      tripId: "trip-001",
      routeNumber: "400",
      routeName: "秋田御所野線",
      destination: "秋田駅東口",
      destinationLabel: "行",
      minutesUntilDeparture: 15,
      departureTime: "12:34",
      cost: 400,
      stopsUntilArrival: "2駅前に到着",
      routeColorText: "秋田御所野線",
    },
  ];

  const pastBus: UpcomingBusInfo = {
    tripId: "trip-past",
    routeNumber: "314",
    routeName: "過去",
    destination: "秋田駅東口",
    destinationLabel: "行",
    minutesUntilDeparture: -12,
    departureTime: "12:22",
    isPast: true,
    routeColorText: "過去",
  };

  it("should display past bus section when pastBus is provided", () => {
    render(
      <BusStopInfoV2
        busStopName="テストバス停"
        pastBus={pastBus}
        upcomingBuses={upcomingBuses}
      />
    );

    expect(screen.getByText("過去のバス")).toBeInTheDocument();
    expect(screen.getByText("過去")).toBeInTheDocument();
    expect(screen.getByText("12分前")).toBeInTheDocument();
  });

  it("should not display past bus section when pastBus is null", () => {
    render(
      <BusStopInfoV2
        busStopName="テストバス停"
        pastBus={null}
        upcomingBuses={upcomingBuses}
      />
    );

    expect(screen.queryByText("過去のバス")).not.toBeInTheDocument();
  });

  it("should display upcoming buses section title", () => {
    render(
      <BusStopInfoV2 busStopName="テストバス停" upcomingBuses={upcomingBuses} />
    );

    expect(screen.getByText("今後のバス")).toBeInTheDocument();
  });
});
