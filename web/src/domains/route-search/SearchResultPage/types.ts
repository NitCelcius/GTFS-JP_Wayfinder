export interface Station {
  stationName: string;
  arrivalTime?: string;
  departureTime?: string;
  arrivalDatetime?: Date; // Should be present only when arrivalTime is present
  departureDatetime?: Date; // Should be present only when departureTime is present
  isTransfer?: boolean;
  cost?: number;
}

export interface RouteOption {
  id: string;
  name: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  transferCount: number;
  fare?: number;
  totalCost?: number;
  stations: Station[];
}

export interface TripDetails {
  fromStation: string;
  toStation: string;
  searchDateTime: string;
  selectedRouteId: string;
  routes: RouteOption[];
}

export interface SearchResultPageProps {
  tripDetails: TripDetails;
  onRouteSelect: (routeId: string) => void;
  onBack: () => void;
  onNavigateToBusStop?: () => void;
  onNavigateToRecent?: () => void;
  showCosts?: boolean;
  isLoading?: boolean;
}
