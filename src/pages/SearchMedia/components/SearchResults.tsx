import MediaGrid from '../../../components/MediaGrid';

interface SearchResultsProps {
  mediaResults: Parameters<typeof MediaGrid>[0]['mediaList'];
  isFetching: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  sentinelRef: React.RefCallback<HTMLDivElement>;
  onMediaClick: (id: number) => void;
}

const SKELETON_COUNT = 6;

const SearchResults = ({
  mediaResults,
  isFetching,
  isFetchingNextPage,
  hasNextPage,
  sentinelRef,
  onMediaClick,
}: SearchResultsProps) => {
  const isInitialLoading = isFetching && mediaResults.length === 0;

  return (
    <div className="relative z-0 max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 py-10">
      {(mediaResults.length > 0 || isInitialLoading) && (
        <>
          <MediaGrid
            title=""
            mediaList={mediaResults}
            onMediaClick={onMediaClick}
            isLoading={isFetching}
          />
          {hasNextPage && (
            <div ref={sentinelRef}>
              {isFetchingNextPage && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 px-4 sm:px-8 lg:px-12 py-10">
                  {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="flex flex-col animate-pulse"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="w-full aspect-2/3 bg-zinc-800 rounded-lg mb-3" />
                      <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-zinc-800 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!isFetching && mediaResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-2xl font-bold text-white mb-2">No results</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;