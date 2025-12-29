import { render, screen } from "@testing-library/react";

import { mockSingleRouteTripDetails, mockTwoRoutesTripDetails } from "@/mocks";

import { SearchResultPage } from "../SearchResultPage";

describe("SearchResultPage", () => {
  const mockOnRouteSelect = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnNavigateToBusStop = jest.fn();
  const mockOnNavigateToRecent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not display RouteTabs when there is only one route", () => {
    render(
      <SearchResultPage
        tripDetails={mockSingleRouteTripDetails}
        onRouteSelect={mockOnRouteSelect}
        onBack={mockOnBack}
        onNavigateToBusStop={mockOnNavigateToBusStop}
        onNavigateToRecent={mockOnNavigateToRecent}
      />
    );

    // Should not display the route tab with "経路 1"
    expect(screen.queryByText("経路 1")).not.toBeInTheDocument();
  });

  it("should display RouteTabs when there are two routes", () => {
    render(
      <SearchResultPage
        tripDetails={mockTwoRoutesTripDetails}
        onRouteSelect={mockOnRouteSelect}
        onBack={mockOnBack}
        onNavigateToBusStop={mockOnNavigateToBusStop}
        onNavigateToRecent={mockOnNavigateToRecent}
      />
    );

    // Should display route tabs
    expect(screen.getByText("経路 1")).toBeInTheDocument();
    expect(screen.getByText("経路 2")).toBeInTheDocument();
  });

  it("should display station names for single route", () => {
    render(
      <SearchResultPage
        tripDetails={mockSingleRouteTripDetails}
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
    render(
      <SearchResultPage
        tripDetails={mockSingleRouteTripDetails}
        onRouteSelect={mockOnRouteSelect}
        onBack={mockOnBack}
        onNavigateToBusStop={mockOnNavigateToBusStop}
        onNavigateToRecent={mockOnNavigateToRecent}
      />
    );

    // TripSummary should be displayed with duration in parentheses
    expect(screen.getByText(/\(12分\)/)).toBeInTheDocument();
  });
});
