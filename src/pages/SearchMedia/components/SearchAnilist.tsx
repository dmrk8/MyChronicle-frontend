import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import MediaGrid from '../../../components/MediaGrid';
import { MediaType } from '../../../constants/mediaConstants';
import { useSearchAnilist } from '../../../hooks/useAnilist';
import {
  ANILIST_SORT_OPTIONS,
  ANILIST_SEASONS,
  type AnilistSortOptions,
  type AnilistSeason,
} from '../../../constants/anilistFilters';
import type {
  AnilistMediaType,
  SearchAnilistParams,
} from '../../../api/anilistApi';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY_PREFIX = 'searchAnilist';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR + 2 - 1940 },
  (_, i) => CURRENT_YEAR + 1 - i,
);

const SearchAnilist = ({ mediaType }: { mediaType: MediaType }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const storageKey = `${STORAGE_KEY_PREFIX}_${mediaType}`;

  const [searchQuery, setSearchQuery] = useState<string>(
    () => sessionStorage.getItem(`${storageKey}_query`) ?? '',
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>(
    () => sessionStorage.getItem(`${storageKey}_query`) ?? '',
  );
  const [sortBy, setSortBy] = useState<AnilistSortOptions>(
    () =>
      (sessionStorage.getItem(`${storageKey}_sort`) as AnilistSortOptions) ??
      ANILIST_SORT_OPTIONS.TRENDING_DESC,
  );
  const [selectedSeason, setSelectedSeason] = useState<AnilistSeason | ''>(
    () =>
      (sessionStorage.getItem(`${storageKey}_season`) as AnilistSeason) ?? '',
  );
  const [selectedYear, setSelectedYear] = useState<number | ''>(() => {
    const stored = sessionStorage.getItem(`${storageKey}_year`);
    return stored ? Number(stored) : '';
  });

  // Reset state when navigated here with { state: { reset: true } }
  useEffect(() => {
    if (location.state?.reset) {
      setSearchQuery('');
      setDebouncedSearchQuery('');
      setSortBy(ANILIST_SORT_OPTIONS.TRENDING_DESC);
      setSelectedSeason('');
      setSelectedYear('');
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  // Persist query to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_query`, searchQuery);
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, storageKey]);

  // Persist sort to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_sort`, sortBy);
  }, [sortBy, storageKey]);

  // Persist season to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_season`, selectedSeason);
  }, [selectedSeason, storageKey]);

  // Persist year to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(
      `${storageKey}_year`,
      selectedYear !== '' ? String(selectedYear) : '',
    );
  }, [selectedYear, storageKey]);

  const isSearching = debouncedSearchQuery.trim().length > 0;

  const anilistParams: SearchAnilistParams = {
    ...(isSearching && { search: debouncedSearchQuery }),
    mediaType: mediaType as AnilistMediaType,
    sort: sortBy,
    ...(selectedSeason && { season: selectedSeason }),
    ...(selectedYear && { seasonYear: selectedYear }),
  };

  const {
    data: mediaData,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchAnilist(anilistParams, {
    enabled: true,
  });

  const mediaResults = mediaData?.pages.flatMap((page) => page.results) ?? [];

  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    enabled: true,
  });

  const openDetails = (id: number) =>
    navigate(`/${mediaType.toLowerCase()}/${id}`);

  const hasActiveFilters = selectedSeason !== '' || selectedYear !== '';

  const clearFilters = () => {
    setSelectedSeason('');
    setSelectedYear('');
  };

  const isAnime = mediaType === MediaType.ANIME;

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-900 via-black to-zinc-900">
      {/* Hero Section with Search */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-blue-600/10 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Search{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-600">
                {mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}
              </span>
            </h1>
            <p className="text-zinc-400 text-lg">
              Explore trending, popular, and upcoming titles
            </p>
          </div>

          {/* Search Bar + Sort By */}
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            {/* Search Input */}
            <div className="relative group flex-1">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative flex items-center">
                <span className="absolute left-5 text-zinc-400 text-xl">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder={`Search for ${mediaType}...`}
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

            {/* Sort By Dropdown */}
            <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="relative appearance-none pl-4 pr-10 py-5 bg-zinc-800/80 backdrop-blur-xl border border-zinc-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm cursor-pointer"
              >
                {Object.entries(ANILIST_SORT_OPTIONS).map(([key, value]) => (
                  <option key={value} value={value} className="bg-zinc-800">
                    {key
                      .split('_')
                      .map((w) => {
                        if (w === 'DESC') return 'Descending';
                        if (w === 'ASC') return 'Ascending';
                        return (
                          w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
                        );
                      })
                      .join(' ')}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none text-xs">
                ▼
              </span>
            </div>
          </div>

          {/* Season & Year Filters */}
          <div className="max-w-3xl mx-auto mt-3 flex items-center gap-3 flex-wrap">
            {/* Season Dropdown — anime only */}
            {isAnime && (
              <div className="relative group shrink-0">
                <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <select
                  value={selectedSeason}
                  onChange={(e) =>
                    setSelectedSeason(e.target.value as AnilistSeason | '')
                  }
                  className={`relative appearance-none pl-4 pr-10 py-3 bg-zinc-800/80 backdrop-blur-xl border rounded-xl text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
                    ${selectedSeason ? 'border-blue-500 text-white' : 'border-zinc-700 text-zinc-400'}`}
                >
                  <option value="" className="bg-zinc-800 text-zinc-400">
                    All Seasons
                  </option>
                  {ANILIST_SEASONS.map((season) => (
                    <option
                      key={season}
                      value={season}
                      className="bg-zinc-800 text-white"
                    >
                      {season.charAt(0) + season.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none text-xs">
                  ▼
                </span>
              </div>
            )}

            {/* Year Dropdown */}
            <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <select
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(e.target.value ? Number(e.target.value) : '')
                }
                className={`relative appearance-none pl-4 pr-10 py-3 bg-zinc-800/80 backdrop-blur-xl border rounded-xl text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
                  ${selectedYear ? 'border-blue-500 text-white' : 'border-zinc-700 text-zinc-400'}`}
              >
                <option value="" className="bg-zinc-800 text-zinc-400">
                  All Years
                </option>
                {YEAR_OPTIONS.map((year) => (
                  <option
                    key={year}
                    value={year}
                    className="bg-zinc-800 text-white"
                  >
                    {year}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none text-xs">
                ▼
              </span>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-xl transition-all duration-200 bg-zinc-800/80 backdrop-blur-xl"
              >
                Clear filters ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Loading State — initial load */}
        {isFetching && mediaResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
            </div>
            <p className="text-zinc-400 text-lg">
              {isSearching
                ? `Searching for "${debouncedSearchQuery}"...`
                : 'Loading...'}
            </p>
          </div>
        )}

        {/* Results Grid */}
        {mediaResults.length > 0 && (
          <>
            <MediaGrid
              title=""
              mediaList={mediaResults}
              onMediaClick={openDetails}
            />

            {/* Infinite Scroll Sentinel */}
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
                  <span className="text-zinc-500 text-sm">Scroll for more</span>
                )}
              </div>
            )}

            {/* End of Results */}
            {!hasNextPage && (
              <div className="text-center py-12 border-t border-zinc-800 mt-8">
                <p className="text-lg font-medium text-zinc-300">
                  You've reached the end!
                </p>
                <p className="text-sm text-zinc-500 mt-1">
                  Showing all {mediaResults.length} results
                </p>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!isFetching && mediaResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="text-8xl mb-6 opacity-50">🔍</div>
            <p className="text-2xl font-bold text-white mb-2">
              No results found
            </p>
            <p className="text-zinc-400 text-center max-w-md">
              We couldn't find any {mediaType} matching "{debouncedSearchQuery}
              ". Try different keywords or check the spelling.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAnilist;
