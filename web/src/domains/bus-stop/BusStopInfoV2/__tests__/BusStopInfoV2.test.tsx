import { render, screen } from "@testing-library/react";

import { BusStopInfoV2 } from "../BusStopInfoV2";

describe("BusStopInfoV2 - Walk Directions Button Visibility", () => {
  const mockUpcomingBuses = [
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

  const defaultProps = {
    busStopId: "stop-001",
    busStopName: "テストバス停",
    distance: "約250m",
    upcomingBuses: mockUpcomingBuses,
    isLoading: false,
    error: null,
    onBack: jest.fn(),
    onRoutineSearch: jest.fn(),
    onWalkDirections: jest.fn(),
    onTransfer: jest.fn(),
    onRouteList: jest.fn(),
    onBusClick: jest.fn(),
  };

  it("should show walk directions button when coordinates are valid and callback is provided", () => {
    render(
      <BusStopInfoV2
        {...defaultProps}
        hasValidCoordinates={true}
        onWalkDirections={jest.fn()}
      />
    );

    const walkButton = screen.getByLabelText("Get walk directions");
    expect(walkButton).toBeInTheDocument();
  });

  it("should hide walk directions button when coordinates are invalid", () => {
    render(
      <BusStopInfoV2
        {...defaultProps}
        hasValidCoordinates={false}
        onWalkDirections={jest.fn()}
      />
    );

    const walkButton = screen.queryByLabelText("Get walk directions");
    expect(walkButton).not.toBeInTheDocument();
  });

  it("should hide walk directions button when onWalkDirections callback is null", () => {
    render(
      <BusStopInfoV2
        {...defaultProps}
        hasValidCoordinates={true}
        onWalkDirections={undefined}
      />
    );

    const walkButton = screen.queryByLabelText("Get walk directions");
    expect(walkButton).not.toBeInTheDocument();
  });

  it("should hide walk directions button when both coordinates are invalid and callback is null", () => {
    render(
      <BusStopInfoV2
        {...defaultProps}
        hasValidCoordinates={false}
        onWalkDirections={undefined}
      />
    );

    const walkButton = screen.queryByLabelText("Get walk directions");
    expect(walkButton).not.toBeInTheDocument();
  });

  it("should show other action buttons regardless of walk directions visibility", () => {
    render(
      <BusStopInfoV2
        {...defaultProps}
        hasValidCoordinates={false}
        onWalkDirections={undefined}
      />
    );

    // These buttons should always be visible
    expect(screen.getByLabelText("Search destinations")).toBeInTheDocument();
    expect(screen.getByLabelText("Transfer options")).toBeInTheDocument();
    expect(screen.getByLabelText("View route list")).toBeInTheDocument();
  });
});
