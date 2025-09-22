export interface RecentBusStopSearch {
  id: string;
  name: string;
  distance: string;
  searchedAt: string;
}

export interface RecentRouteSearch {
  id: string;
  fromStation: string;
  toStation: string;
  searchedAt: string;
}