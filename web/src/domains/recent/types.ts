export interface RecentBusStopSearch {
  recordId: string;
  id: string;
  name: string;
  distance: string;
  searchedAt: string;
}

export interface RecentRouteSearch {
  id: string;
  fromStopId: string;
  toStopId: string;
  fromStopName: string;
  toStopName: string;
  searchedAt: string;
}
