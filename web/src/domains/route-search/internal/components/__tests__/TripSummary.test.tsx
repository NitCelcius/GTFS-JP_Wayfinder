import { render, screen } from "@testing-library/react";

import type { RouteOption } from "../../SearchResultPage/types";
import { TripSummary } from "../TripSummary";

describe("TripSummary", () => {
  const baseRoute: RouteOption = {
    id: "route-1",
    name: "東駅 → 大学病院",
    departureTime: "08:15:00",
    arrivalTime: "09:00:00",
    duration: "45分",
    transferCount: 0,
    fare: 350,
    totalCost: 350,
    stations: [
      {
        stationName: "東駅",
        departureTime: "08:15:00",
        departureDatetime: new Date("2024-01-15T08:15:00"),
      },
      {
        stationName: "大学病院",
        arrivalTime: "09:00:00",
        arrivalDatetime: new Date("2024-01-15T09:00:00"),
        cost: 350,
      },
    ],
  };

  it("should render departure and arrival times", () => {
    render(<TripSummary route={baseRoute} />);

    expect(screen.getByText(/08:15:00 → 09:00:00 \(45分\)/)).toBeInTheDocument();
  });

  it("should render transfer count and total cost", () => {
    render(<TripSummary route={baseRoute} />);

    expect(screen.getByText(/乗換 0回 \/ 合計 350円/)).toBeInTheDocument();
  });

  it("should display relative time when provided", () => {
    const routeWithRelativeTime: RouteOption = {
      ...baseRoute,
      relativeTimeUntilDeparture: "5分後にバス停発",
    };

    render(<TripSummary route={routeWithRelativeTime} />);

    expect(screen.getByText("5分後にバス停発")).toBeInTheDocument();
  });

  it("should not display relative time section when not provided", () => {
    render(<TripSummary route={baseRoute} />);

    // Check that the relative time element is not rendered
    expect(screen.queryByText(/分後にバス停発/)).not.toBeInTheDocument();
    expect(screen.queryByText(/出発済み/)).not.toBeInTheDocument();
  });

  it("should display past departure time correctly", () => {
    const routeWithPastDeparture: RouteOption = {
      ...baseRoute,
      relativeTimeUntilDeparture: "10分前に出発済み",
    };

    render(<TripSummary route={routeWithPastDeparture} />);

    expect(screen.getByText("10分前に出発済み")).toBeInTheDocument();
  });

  it("should display imminent departure", () => {
    const routeWithImminentDeparture: RouteOption = {
      ...baseRoute,
      relativeTimeUntilDeparture: "まもなく出発",
    };

    render(<TripSummary route={routeWithImminentDeparture} />);

    expect(screen.getByText("まもなく出発")).toBeInTheDocument();
  });

  it("should handle multiple transfers", () => {
    const routeWithTransfers: RouteOption = {
      ...baseRoute,
      transferCount: 2,
      totalCost: 700,
      relativeTimeUntilDeparture: "15分後にバス停発",
    };

    render(<TripSummary route={routeWithTransfers} />);

    expect(screen.getByText(/乗換 2回 \/ 合計 700円/)).toBeInTheDocument();
    expect(screen.getByText("15分後にバス停発")).toBeInTheDocument();
  });
});
