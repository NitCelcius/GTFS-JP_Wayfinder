import type { TravelOnceResponse } from "@/api/types.gen";

export interface BusStopSearchResult {
  stop_name: string;
  candidate_stop_id_list: string[];
}

export interface RouteSearchData {
  origin: {
    name: string;
    candidateStopIds: string[];
  };
  destination: {
    name: string;
    candidateStopIds: string[];
  };
}

export interface RouteSearchResult {
  travels: TravelOnceResponse[];
  originStopName: string;
  destinationStopName: string;
  searchTime?: string;
}

export interface RouteSearchState {
  isLoading: boolean;
  result: RouteSearchResult | null;
  error: string | null;
}
