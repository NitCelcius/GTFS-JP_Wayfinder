import { render, screen } from "@testing-library/react";

import { SearchResultPage } from "../SearchResultPage";
import { TripDetails } from "../types";

describe("SearchResultPage", () => {
  const mockOnRouteSelect = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnNavigateToBusStop = jest.fn();
  const mockOnNavigateToRecent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockTripDetails = (routeCount: number): TripDetails => {
    const routes = Array.from({ length: routeCount }, (_, index) => ({
      id: `route-${index + 1}`,
      name: `経路 ${index + 1}`,
      departureTime: "08:00",
      arrivalTime: "08:15",
      duration: "15分",
      transferCount: 0,
      fare: 150,
      totalCost: 150,
      stations: [
        {
          stationName: "東駅",
          departureTime: "08:00",
          departureDatetime: new Date("2021-01-01T08:00:00"),
        },
        {
          stationName: "大学病院",
          arrivalTime: "08:15",
          arrivalDatetime: new Date("2021-01-01T08:15:00"),
          cost: 150,
        },
      ],
    }));

    return {
      fromStation: "東駅",
      toStation: "大学病院",
      searchDateTime: "2021-01-01T08:00",
      selectedRouteId: routes[0].id,
      routes,
    };
  };

  it("should not display RouteTabs when there is only one route", () => {
    const tripDetails = createMockTripDetails(1);

    render(
      <SearchResultPage
        tripDetails={tripDetails}
        onRouteSelect={mockOnRouteSelect}
        onBack={mockOnBack}
        onNavigateToBusStop={mockOnNavigateToBusStop}
        onNavigateToRecent={mockOnNavigateToRecent}
      />
    );

    // Should not display the route tab with "経路 1"
    expect(screen.queryByText("経路 1")).not.toBeInTheDocument();
  });

  it("should display RouteTabs when there are multiple routes", () => {
    const tripDetails = createMockTripDetails(3);

    render(
      <SearchResultPage
        tripDetails={tripDetails}
        onRouteSelect={mockOnRouteSelect}
        onBack={mockOnBack}
        onNavigateToBusStop={mockOnNavigateToBusStop}
        onNavigateToRecent={mockOnNavigateToRecent}
      />
    );

    // Should display all route tabs
    expect(screen.getByText("経路 1")).toBeInTheDocument();
    expect(screen.getByText("経路 2")).toBeInTheDocument();
    expect(screen.getByText("経路 3")).toBeInTheDocument();
  });

  it("should display station names for single route", () => {
    const tripDetails = createMockTripDetails(1);

    render(
      <SearchResultPage
        tripDetails={tripDetails}
        onRouteSelect={mockOnRouteSelect}
        onBack={mockOnBack}
        onNavigateToBusStop={mockOnNavigateToBusStop}
        onNavigateToRecent={mockOnNavigateToRecent}
      />
    );

    // Should still display the route details even without tabs
    expect(screen.getByText("東駅")).toBeInTheDocument();
    expect(screen.getByText("大学病院")).toBeInTheDocument();
  });

  it("should display TripSummary for single route", () => {
    const tripDetails = createMockTripDetails(1);

    render(
      <SearchResultPage
        tripDetails={tripDetails}
        onRouteSelect={mockOnRouteSelect}
        onBack={mockOnBack}
        onNavigateToBusStop={mockOnNavigateToBusStop}
        onNavigateToRecent={mockOnNavigateToRecent}
      />
    );

    // TripSummary should be displayed with duration in parentheses
    expect(screen.getByText(/\(15分\)/)).toBeInTheDocument();
  });
});
