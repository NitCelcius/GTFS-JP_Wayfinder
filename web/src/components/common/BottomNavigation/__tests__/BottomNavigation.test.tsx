import { fireEvent, render, screen } from "@testing-library/react";

import { BottomNavigation } from "../BottomNavigation";

describe("BottomNavigation", () => {
  const mockOnTabClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all three navigation items", () => {
    render(<BottomNavigation activeTab="route" onTabClick={mockOnTabClick} />);

    expect(screen.getByText("バス停")).toBeInTheDocument();
    expect(screen.getByText("行き方")).toBeInTheDocument();
    expect(screen.getByText("履歴")).toBeInTheDocument();
  });

  it("should highlight the active tab", () => {
    const { container } = render(
      <BottomNavigation activeTab="route" onTabClick={mockOnTabClick} />
    );

    const navItems = container.querySelectorAll('[data-name="NavItem"]');
    expect(navItems[1]).toHaveClass("navItemActive"); // route is the second item
  });

  it("should call onTabClick when a tab is clicked", () => {
    render(<BottomNavigation activeTab="route" onTabClick={mockOnTabClick} />);

    const busStopTab = screen.getByText("バス停");
    fireEvent.click(busStopTab);

    expect(mockOnTabClick).toHaveBeenCalledWith("bus-stop");
  });

  it("should create a ripple element when clicking a tab", () => {
    render(<BottomNavigation activeTab="route" onTabClick={mockOnTabClick} />);

    const busStopTab = screen.getByText("バス停");
    const navItemBefore = busStopTab.closest('[data-name="NavItem"]');
    const ripplesBefore =
      navItemBefore?.querySelectorAll('[class*="ripple"]') || [];
    expect(ripplesBefore.length).toBe(0);

    fireEvent.click(busStopTab);

    const navItemAfter = busStopTab.closest('[data-name="NavItem"]');
    const ripplesAfter =
      navItemAfter?.querySelectorAll('[class*="ripple"]') || [];
    expect(ripplesAfter.length).toBeGreaterThan(0);
  });

  it("should apply primary ripple color when switching to a different tab", () => {
    render(<BottomNavigation activeTab="route" onTabClick={mockOnTabClick} />);

    const busStopTab = screen.getByText("バス停");
    fireEvent.click(busStopTab);

    const navItem = busStopTab.closest('[data-name="NavItem"]');
    const ripple = navItem?.querySelector('[class*="ripple"]');
    expect(ripple?.className).toContain("ripplePrimary");
  });

  it("should apply disabled ripple color when clicking the same tab", () => {
    render(<BottomNavigation activeTab="route" onTabClick={mockOnTabClick} />);

    const routeTab = screen.getByText("行き方");
    fireEvent.click(routeTab);

    const navItem = routeTab.closest('[data-name="NavItem"]');
    const ripple = navItem?.querySelector('[class*="ripple"]');
    expect(ripple?.className).toContain("rippleDisabled");
  });

  it("should handle clicks on all three tabs", () => {
    render(<BottomNavigation activeTab="route" onTabClick={mockOnTabClick} />);

    fireEvent.click(screen.getByText("バス停"));
    expect(mockOnTabClick).toHaveBeenCalledWith("bus-stop");

    fireEvent.click(screen.getByText("行き方"));
    expect(mockOnTabClick).toHaveBeenCalledWith("route");

    fireEvent.click(screen.getByText("履歴"));
    expect(mockOnTabClick).toHaveBeenCalledWith("recent");
  });
});
