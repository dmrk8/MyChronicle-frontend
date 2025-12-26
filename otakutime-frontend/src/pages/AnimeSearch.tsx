import { useState, useEffect } from 'react';
import { useFeaturedMediaAnilist } from '../hooks/useAnilistQueries';
import { useSearchAnilist } from '../hooks/useAnilistQueries';
import MediaGrid from '../components/GridRowMediaDisplay';
import type { SearchAnilistParams } from '../api/anilistApi';

const AnimeSearch: React.FC = () => {
  const { data, isLoading, isError } = useFeaturedMediaAnilist('ANIME');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(''); 

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchParams: SearchAnilistParams = {
    mediaType: 'anime',
    search: debouncedSearchQuery,
    perPage: 20,
  };

  const { data: searchData, isFetching: isSearching } =
    useSearchAnilist(searchParams);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const trending = data?.trending ?? [];
  const popularSeason = data?.popularSeason ?? [];
  const upcoming = data?.upcoming ?? [];
  const allTime = data?.allTime ?? [];

  const searchResults = searchData?.pages.flatMap((page) => page.results) ?? [];
  const displaySearchResults = searchQuery.trim().length > 0;

  return (
    <div className="max-w-full mx-80">
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search anime..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      {displaySearchResults ? (
        <>
          {isSearching && <div className="text-center py-10">Searching...</div>}
          {!isSearching && searchResults.length > 0 && (
            <MediaGrid
              title={`Search Results for "${searchQuery}"`}
              mediaList={searchResults}
            />
          )}
          {!isSearching && searchResults.length === 0 && (
            <div className="text-center py-10">No results found</div>
          )}
        </>
      ) : (
        <>
          {isLoading && <div className="text-center py-10">Loading...</div>}
          {isError && (
            <div className="text-center text-red-500 py-10">
              No data available
            </div>
          )}
          {!isLoading && !isError && (
            <>
              <MediaGrid title="Trending Anime" mediaList={trending} />
              <MediaGrid
                title="Popular This Season"
                mediaList={popularSeason}
              />
              <MediaGrid title="Upcoming Anime" mediaList={upcoming} />
              <MediaGrid title="Popular All Time" mediaList={allTime} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AnimeSearch;
