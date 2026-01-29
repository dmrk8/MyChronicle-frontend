import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import MediaGrid from '../../../components/MediaGrid';
import { MediaType } from '../../../constants/mediaConstants';
import FeaturedMedia from './FeaturedMedia';
import SearchBar from './SearchBar';
import { useSearchAnilist } from '../../../hooks/useAnilist';
import type {
  AnilistMediaType,
  SearchAnilistParams,
} from '../../../api/anilistApi';

const SearchAnilist = ({ mediaType }: { mediaType: MediaType }) => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const displaySearchResults = debouncedSearchQuery.trim().length > 0;

  const anilistParams: SearchAnilistParams = {
    search: debouncedSearchQuery,
    mediaType: mediaType as AnilistMediaType,
  };

  const {
    data: searchData,
    isFetching: isSearching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchAnilist(anilistParams, {
    enabled: displaySearchResults,
  });

  const searchResults = searchData?.pages.flatMap((page) => page.results) ?? [];

  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    enabled: displaySearchResults,
  });

  const openDetails = (id: number) =>
    navigate(`/${mediaType.toLowerCase()}/${id}`);

  const searchPlaceholder = `Search for ${mediaType}...`;

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-900 via-black to-zinc-900">
      {/* Hero Section with Search */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder={searchPlaceholder}
        mediaType={mediaType}
      />

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
          <FeaturedMedia mediaType={mediaType} />
        )}
      </div>
    </div>
  );
};

export default SearchAnilist;
