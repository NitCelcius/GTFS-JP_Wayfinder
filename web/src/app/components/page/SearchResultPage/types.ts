export interface StationStop {
  stationName: string;
  arrivalTime?: string;
  departureTime?: string;
  cost?: number;
  isTransfer?: boolean;
}

export interface Route {
  id: string;
  name: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  transferCount: number;
  totalCost: number;
  stations: StationStop[];
}

export interface TripDetails {
  fromStation: string;
  toStation: string;
  searchDateTime: string;
  routes: Route[];
  selectedRouteId?: string;
}

export interface SearchResultPageProps {
  tripDetails: TripDetails;
  onRouteSelect?: (routeId: string) => void;
  onBack?: () => void;
  onNavigateToBusStop?: () => void;
  onNavigateToRecent?: () => void;
  showCosts?: boolean;
  isLoading?: boolean;
}