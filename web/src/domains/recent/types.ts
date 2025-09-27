export interface RecentBusStopSearch {
  id: string;
  name: string;
  searchedAt: string;
}

export interface RecentRouteSearch {
  id: string;
  fromStation: string;
  toStation: string;
  searchedAt: string;
}
