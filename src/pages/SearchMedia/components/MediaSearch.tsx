import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import MediaGrid from '../../../components/MediaGrid';
import { MediaType } from '../../../constants/mediaConstants';
import { useFeaturedMedia, useMediaSearch } from '../../../hooks/useMedia';

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
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const displaySearchResults = debouncedSearchQuery.trim().length > 0;

  const anilistParams =
    mediaType === MediaType.ANIME || mediaType === MediaType.MANGA
      ? {
          search: debouncedSearchQuery,
          mediaType: mediaType,
          perPage: 20,
        }
      : undefined;

  const tmdbMovieParams =
    mediaType === MediaType.MOVIE
      ? {
          search: debouncedSearchQuery,
        }
      : undefined;

  const tmdbTvParams =
    mediaType === MediaType.TV
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
  } = useMediaSearch(mediaType, anilistParams, tmdbMovieParams, tmdbTvParams, {
    enabled: displaySearchResults,
  });

  const searchResults = searchData?.pages.flatMap((page) => page.results) ?? [];

  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    enabled: displaySearchResults,
  });

  const openDetails = (id: number) => navigate(`/${mediaType}/${id}`);

  const searchPlaceholder = `Search for ${mediaType}...`;
  const trendingTitle = `Trending ${
    mediaType.charAt(0).toUpperCase() + mediaType.slice(1)
  }`;
  const popularSeasonTitle = 'Popular This Season';
  const upcomingTitle = `Upcoming ${
    mediaType.charAt(0).toUpperCase() + mediaType.slice(1)
  }`;
  const allTimeTitle = 'Popular All Time';
  const popularManhwaTitle = 'Popular Manhwas';

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-900 via-black to-zinc-900">
      {/* Hero Section with Search */}
      <div className="relative overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-blue-600/10 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Page Title */}
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Discover{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-600">
                {mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}
              </span>
            </h1>
            <p className="text-zinc-400 text-lg">
              Explore trending, popular, and upcoming titles
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative flex items-center">
                <span className="absolute left-5 text-zinc-400 text-xl">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-4 py-5 bg-zinc-800/80 backdrop-blur-xl border border-zinc-700 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 text-zinc-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search Results */}
        {displaySearchResults ? (
          <div>
            {/* Loading State */}
            {isSearching && searchResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full" />
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                </div>
                <p className="text-zinc-400 text-lg">
                  Searching for "{debouncedSearchQuery}"...
                </p>
              </div>
            )}

            {/* Search Results Grid */}
            {searchResults.length > 0 && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Search Results for{' '}
                    <span className="text-blue-400">
                      "{debouncedSearchQuery}"
                    </span>
                  </h2>
                  <p className="text-zinc-400 mt-1">
                    {searchResults.length} results found
                  </p>
                </div>

                <MediaGrid
                  title=""
                  mediaList={searchResults}
                  onMediaClick={openDetails}
                />

                {/* Infinite Scroll Loading */}
                {hasNextPage && (
                  <div
                    ref={sentinelRef}
                    className="flex items-center justify-center py-12"
                  >
                    {isFetchingNextPage ? (
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    ) : (
                      <span className="text-zinc-500 text-sm">
                        Scroll for more
                      </span>
                    )}
                  </div>
                )}

                {/* End of Results */}
                {!hasNextPage && searchResults.length > 0 && (
                  <div className="text-center py-12 border-t border-zinc-800 mt-8">
                    <p className="text-lg font-medium text-zinc-300">
                      You've reached the end!
                    </p>
                    <p className="text-sm text-zinc-500 mt-1">
                      Showing all {searchResults.length} results
                    </p>
                  </div>
                )}
              </>
            )}

            {/* No Results */}
            {!isSearching && searchResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="text-8xl mb-6 opacity-50">🔍</div>
                <p className="text-2xl font-bold text-white mb-2">
                  No results found
                </p>
                <p className="text-zinc-400 text-center max-w-md">
                  We couldn't find any {mediaType} matching "
                  {debouncedSearchQuery}". Try different keywords or check the
                  spelling.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full" />
                  <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
                </div>
                <p className="text-zinc-400 text-lg">
                  Loading amazing content...
                </p>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="text-6xl mb-4">❌</div>
                <p className="text-xl font-medium text-red-400 mb-2">
                  Oops! Something went wrong
                </p>
                <p className="text-zinc-500">
                  Unable to load content. Please try again later.
                </p>
              </div>
            )}

            {/* Featured Content */}
            {!isLoading && !isError && (
              <div className="space-y-16">
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaSearch;
