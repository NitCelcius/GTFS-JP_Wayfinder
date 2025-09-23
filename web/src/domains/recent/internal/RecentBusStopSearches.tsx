import { RecentBusStopSearch } from "../types";

interface RecentBusStopSearchesProps {
  recentBusStops: RecentBusStopSearch[];
  onBusStopSelect?: (busStopId: string) => void;
  onViewMore?: () => void;
}

function LocationIcon() {
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
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function RecentBusStopItem({
  busStop,
  onSelect,
}: {
  busStop: RecentBusStopSearch;
  onSelect?: (id: string) => void;
}) {
  const handleCardClick = () => onSelect?.(busStop.id);
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(busStop.id);
  };

  return (
    <div
      className="w-full bg-white border border-gray-200 rounded-[var(--radius-lg)] p-[var(--size-spacing-lg)] mb-[var(--size-spacing-md)] cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200 active:scale-[0.98]"
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-[var(--size-spacing-md)] flex-1">
          <div className="w-[1.5rem] h-[1.5rem] flex items-center justify-center text-gray-600">
            <LocationIcon />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[1.125rem] mb-[var(--size-spacing-xs)]">
              {busStop.name}
            </span>
            <div className="flex items-center gap-[var(--size-spacing-md)]">
              <span className="text-[1rem] text-gray-600">
                {busStop.distance}
              </span>
              <span className="text-[0.875rem] text-gray-500">
                ・{busStop.searchedAt}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <button
            className="bg-[var(--color-route-primary)] text-white px-[var(--size-spacing-lg)] py-[var(--size-spacing-sm)] rounded-[var(--radius-md)] hover:bg-[var(--color-route-primary-dark)] transition-colors duration-200 min-w-[4rem] text-center"
            onClick={handleButtonClick}
          >
            <span className="text-[0.875rem]">選択</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function RecentBusStopSearches({
  recentBusStops,
  onBusStopSelect,
  onViewMore,
}: RecentBusStopSearchesProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-[var(--size-spacing-lg)]">
        <h2 className="text-[1.25rem]">バス停</h2>
        {recentBusStops.length > 0 && (
          <button
            className="text-[var(--color-route-primary)] hover:text-[var(--color-route-primary-dark)] text-[0.875rem] transition-colors"
            onClick={onViewMore}
          >
            もっと見る
          </button>
        )}
      </div>
      {recentBusStops.length === 0 ? (
        <div className="text-center py-[var(--size-spacing-2xl)] text-gray-500">
          <p>最近検索したバス停はありません</p>
        </div>
      ) : (
        <div>
          {recentBusStops.map((bs) => (
            <RecentBusStopItem
              key={bs.id}
              busStop={bs}
              onSelect={onBusStopSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
