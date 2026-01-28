import { useCallback } from "react";

type BottomNavTab = "bus-stop" | "route" | "recent";

interface NavigationCallbacks {
  onNavigateToBusStop?: () => void;
  onNavigateToRoute?: () => void;
  onNavigateToRecent?: () => void;
}

/**
 * Hook to create a bottom navigation click handler.
 *
 * @param activeTab - The currently active tab (navigation to this tab is ignored)
 * @param callbacks - Navigation callbacks for each tab
 * @returns A memoized click handler for the bottom navigation
 *
 * @example
 * ```tsx
 * const handleBottomNavClick = useBottomNavigation("bus-stop", {
 *   onNavigateToRoute,
 *   onNavigateToRecent,
 * });
 *
 * <BottomNavigation activeTab="bus-stop" onTabClick={handleBottomNavClick} />
 * ```
 */
export function useBottomNavigation(
  activeTab: BottomNavTab,
  callbacks: NavigationCallbacks
) {
  const { onNavigateToBusStop, onNavigateToRoute, onNavigateToRecent } =
    callbacks;

  return useCallback(
    (tab: BottomNavTab) => {
      // Ignore clicks on the currently active tab
      if (tab === activeTab) {
        return;
      }

      switch (tab) {
        case "bus-stop":
          onNavigateToBusStop?.();
          break;
        case "route":
          onNavigateToRoute?.();
          break;
        case "recent":
          onNavigateToRecent?.();
          break;
      }
    },
    [activeTab, onNavigateToBusStop, onNavigateToRoute, onNavigateToRecent]
  );
}
