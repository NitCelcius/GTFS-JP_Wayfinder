import { RecentRouteSearch } from "../types";

interface RecentRouteSearchesProps {
  recentRoutes: RecentRouteSearch[];
  // call with (fromStation, toStation) to match RecentPage handler
  onRouteSelect?: (fromStation: string, toStation: string) => void;
  onViewMore?: () => void;
}

function RouteIcon() {
  return (
    <svg
      className="block size-full"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10h4l3 8 4-16 3 8h4"
      />
    </svg>
  );
}

function RecentRouteItem({
  route,
  onSelect,
}: {
  route: RecentRouteSearch;
  onSelect?: (fromStation: string, toStation: string) => void;
}) {
  const handleClick = () => onSelect?.(route.fromStation, route.toStation);

  return (
    <div
      onClick={handleClick}
      className="w-full bg-white border border-gray-200 rounded-[var(--radius-lg)] p-[var(--size-spacing-lg)] mb-[var(--size-spacing-md)] cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200 active:scale-[0.98]"
    >
      <div className="flex items-center gap-[var(--size-spacing-md)]">
        <div className="w-[1.5rem] h-[1.5rem] flex items-center justify-center text-gray-600">
          <RouteIcon />
        </div>
        <div className="flex flex-col">
          <span className="text-[1.125rem]">{`${route.fromStation} → ${route.toStation}`}</span>
          <div className="text-[0.875rem] text-gray-600">
            {route.searchedAt}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecentRouteSearches({
  recentRoutes,
  onRouteSelect,
  onViewMore,
}: RecentRouteSearchesProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-[var(--size-spacing-lg)]">
        <h2 className="text-[1.25rem]">経路</h2>
        {recentRoutes.length > 0 && (
          <button
            className="text-[var(--color-route-primary)] hover:text-[var(--color-route-primary-dark)] text-[0.875rem] transition-colors"
            onClick={onViewMore}
          >
            もっと見る
          </button>
        )}
      </div>
      {recentRoutes.length === 0 ? (
        <div className="text-center py-[var(--size-spacing-2xl)] text-gray-500">
          <p>最近検索した経路はありません</p>
        </div>
      ) : (
        <div>
          {recentRoutes.map((r) => (
            <RecentRouteItem key={r.id} route={r} onSelect={onRouteSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
