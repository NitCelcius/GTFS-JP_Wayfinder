export interface RecentBusStopSearch {
  id: string;
  name: string;
  searchedAt: Date;
}

export interface RecentRouteSearch {
  id: string;
  fromStation: string;
  toStation: string;
  searchedAt: Date;
}
