import { render, screen } from "@testing-library/react";

import { BusStopInfoV2 } from "../BusStopInfoV2";

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
    expect(screen.getByLabelText("Transfer options")).toBeInTheDocument();
    expect(screen.getByLabelText("View route list")).toBeInTheDocument();
  });
});
