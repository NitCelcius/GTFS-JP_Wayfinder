export interface RouteOption {
  id: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  fare?: number;
  tripId: string;
}

export interface RouteOverviewData {
  fromStation: string;
  toStation: string;
  searchDateTime: string;
  routes: RouteOption[];
}

export interface RouteOverviewPageProps {
  routeData: RouteOverviewData;
  onRouteSelect: (tripId: string) => void;
  onBack: () => void;
  onNavigateToBusStop?: () => void;
  onNavigateToRecent?: () => void;
}
