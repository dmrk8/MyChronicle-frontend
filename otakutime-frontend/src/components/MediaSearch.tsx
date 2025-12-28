import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import MediaGrid from './GridRowMediaDisplay';
import type { MediaType } from '../types/MediaInterface';
import { useFeaturedMedia, useMediaSearch } from '../hooks/useMediaQueries';

const MediaSearch = ({ mediaType }: { mediaType: MediaType }) => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useFeaturedMedia(mediaType);

  const trending = data?.trending ?? [];
  const popularSeason = data?.popularSeason ?? [];
  const upcoming = data?.upcoming ?? [];
  const allTime = data?.allTime ?? [];
  const popularManhwa = data?.allTimeManhwa ?? [];

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const displaySearchResults = debouncedSearchQuery.trim().length > 0;

  // Prepare search parameters based on media type
  const anilistParams =
    mediaType === 'anime' || mediaType === 'manga'
      ? {
          search: debouncedSearchQuery,
          mediaType: mediaType as 'anime' | 'manga',
          perPage: 20,
        }
      : undefined;

  const tmdbMovieParams =
    mediaType === 'movie'
      ? {
          search: debouncedSearchQuery,
        }
      : undefined;

  const tmdbTvParams =
    mediaType === 'tv'
      ? {
          search: debouncedSearchQuery,
        }
      : undefined;

  const {
    data: searchData,
    isFetching: isSearching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMediaSearch(
    mediaType,
    undefined,
    anilistParams,
    tmdbMovieParams,
    tmdbTvParams,
    { enabled: displaySearchResults }
  );

  const searchResults = searchData?.pages.flatMap((page) => page.results) ?? [];

  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    enabled: displaySearchResults,
  });

  const openDetails = (id: number) => navigate(`/${mediaType}/${id}`);

  const searchPlaceholder = `Search ${mediaType}...`;
  const trendingTitle = `Trending ${
    mediaType.charAt(0).toUpperCase() + mediaType.slice(1)
  }`;
  const popularSeasonTitle =
    mediaType === 'anime' ? 'Popular This Season' : 'Popular This Season'; // Adjust if needed
  const upcomingTitle = `Upcoming ${
    mediaType.charAt(0).toUpperCase() + mediaType.slice(1)
  }`;
  const allTimeTitle = `Popular All Time`;
  const popularManhwaTitle = `Popular Manhwas`;

  return (
    <div className="max-w-full mx-80">
      <div className="mb-8 flex gap-4">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      {/* Search Results */}
      {displaySearchResults ? (
        <div>
          {/* Initial Loading */}
          {isSearching && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-gray-600 dark:text-gray-400">Searching...</p>
            </div>
          )}

          {/* Search Results Grid */}
          {searchResults.length > 0 && (
            <>
              <MediaGrid
                title={`Search Results for "${debouncedSearchQuery}"`}
                mediaList={searchResults}
                onMediaClick={openDetails}
              />

              {/* Infinite Scroll Sentinel */}
              {hasNextPage && (
                <div
                  ref={sentinelRef}
                  className="flex items-center justify-center py-8 min-h-[80px]"
                >
                  {isFetchingNextPage ? (
                    <div className=" gap-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Loading more...
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      Scroll for more
                    </span>
                  )}
                </div>
              )}

              {/* End of Results */}
              {!hasNextPage && searchResults.length > 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-lg font-medium">You've reached the end!</p>
                  <p className="text-sm mt-1">
                    Showing all {searchResults.length} results
                  </p>
                </div>
              )}
            </>
          )}

          {/* No Results */}
          {!isSearching && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                No results found
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Try searching for "{debouncedSearchQuery}" with different
                keywords
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {isLoading && <div className="text-center py-10">Loading...</div>}
          {isError && (
            <div className="text-center text-red-500 py-10">
              No data available
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {trending.length > 0 && (
                <MediaGrid
                  title={trendingTitle}
                  mediaList={trending}
                  onMediaClick={openDetails}
                />
              )}
              {popularSeason.length > 0 && (
                <MediaGrid
                  title={popularSeasonTitle}
                  mediaList={popularSeason}
                  onMediaClick={openDetails}
                />
              )}
              {upcoming.length > 0 && (
                <MediaGrid
                  title={upcomingTitle}
                  mediaList={upcoming}
                  onMediaClick={openDetails}
                />
              )}
              {allTime.length > 0 && (
                <MediaGrid
                  title={allTimeTitle}
                  mediaList={allTime}
                  onMediaClick={openDetails}
                />
              )}
              {popularManhwa.length > 0 && (
                <MediaGrid
                  title={popularManhwaTitle}
                  mediaList={popularManhwa}
                  onMediaClick={openDetails}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaSearch;
