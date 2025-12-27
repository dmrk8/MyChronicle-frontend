import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useFeaturedMediaAnilist,
  useSearchAnilist,
} from '../hooks/useAnilistQueries';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import MediaGrid from '../components/GridRowMediaDisplay';
import type { SearchAnilistParams } from '../api/anilistApi';

const AnimeSearch: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useFeaturedMediaAnilist('ANIME');

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchParams: SearchAnilistParams = {
    mediaType: 'anime',
    search: debouncedSearchQuery,
    perPage: 20,
  };

  const {
    data: searchData,
    isFetching: isSearching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchAnilist(searchParams);

  const trending = data?.trending ?? [];
  const popularSeason = data?.popularSeason ?? [];
  const upcoming = data?.upcoming ?? [];
  const allTime = data?.allTime ?? [];

  const searchResults = searchData?.pages.flatMap((page) => page.results) ?? [];
  const displaySearchResults = debouncedSearchQuery.trim().length > 0;

  useInfiniteScroll({
    callback: () => fetchNextPage(),
    hasNextPage: hasNextPage ?? false,
    isLoading: isFetchingNextPage,
  });

  const openDetails = (id: number) => navigate(`/anime/${id}`);

  return (
    <div className="max-w-full mx-80">
      <div className="mb-8 flex gap-4">
        <input
          type="text"
          placeholder="Search anime..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      {displaySearchResults ? (
        <div key="search-results">
          {isSearching && searchResults.length === 0 && (
            <div className="text-center py-10">Searching...</div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <MediaGrid
              title={`Search Results for "${debouncedSearchQuery}"`}
              mediaList={searchResults}
              onMediaClick={openDetails}
            />
          )}

          {!isSearching && searchResults.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              No results found for "{debouncedSearchQuery}"
            </div>
          )}
        </div>
      ) : (
        <div key="featured-content">
          {isLoading && <div className="text-center py-10">Loading...</div>}
          {isError && (
            <div className="text-center text-red-500 py-10">
              No data available
            </div>
          )}

          {!isLoading && !isError && (
            <>
              <MediaGrid
                title="Trending Anime"
                mediaList={trending}
                onMediaClick={openDetails}
              />
              <MediaGrid
                title="Popular This Season"
                mediaList={popularSeason}
                onMediaClick={openDetails}
              />
              <MediaGrid
                title="Upcoming Anime"
                mediaList={upcoming}
                onMediaClick={openDetails}
              />
              <MediaGrid
                title="Popular All Time"
                mediaList={allTime}
                onMediaClick={openDetails}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AnimeSearch;
