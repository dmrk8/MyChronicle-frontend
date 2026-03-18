import { useState, useEffect, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGetUserMediaEntriesPaginated } from '../hooks/useUserMediaEntry';
import MediaGrid from '../components/MediaGrid';
import {
  UserMediaEntryStatus,
  UserMediaEntrySortFields,
  UserMediaEntrySortOptions,
} from '../types/UserMediaEntry';
import { MediaType } from '../constants/mediaConstants';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const STORAGE_KEY = 'library';

const LibraryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState<MediaType>(
    () =>
      (sessionStorage.getItem(`${STORAGE_KEY}_type`) as MediaType) ??
      MediaType.ANIME,
  );
  const [selectedStatus, setSelectedStatus] = useState<
    UserMediaEntryStatus | 'all'
  >(
    () =>
      (sessionStorage.getItem(`${STORAGE_KEY}_status`) as
        | UserMediaEntryStatus
        | 'all') ?? 'all',
  );
  const [isFavorite, setIsFavorite] = useState<boolean | undefined>(() => {
    const stored = sessionStorage.getItem(`${STORAGE_KEY}_favorite`);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    return undefined;
  });
  const [sortBy, setSortBy] = useState<UserMediaEntrySortFields>(
    () =>
      (sessionStorage.getItem(
        `${STORAGE_KEY}_sortBy`,
      ) as UserMediaEntrySortFields) ?? UserMediaEntrySortFields.UPDATED_AT,
  );
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>(
    () =>
      (sessionStorage.getItem(`${STORAGE_KEY}_sortDir`) as 'ASC' | 'DESC') ??
      'DESC',
  );
  const [includeAdult, setIncludeAdult] = useState<boolean>(
    () => sessionStorage.getItem(`${STORAGE_KEY}_adult`) === 'true',
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    () => sessionStorage.getItem(`${STORAGE_KEY}_query`) ?? '',
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>(
    () => sessionStorage.getItem(`${STORAGE_KEY}_query`) ?? '',
  );

  useEffect(() => {
    sessionStorage.setItem(`${STORAGE_KEY}_type`, selectedType);
  }, [selectedType]);

  useEffect(() => {
    sessionStorage.setItem(`${STORAGE_KEY}_status`, selectedStatus);
  }, [selectedStatus]);

  useEffect(() => {
    sessionStorage.setItem(
      `${STORAGE_KEY}_favorite`,
      isFavorite === undefined ? '' : String(isFavorite),
    );
  }, [isFavorite]);

  useEffect(() => {
    sessionStorage.setItem(`${STORAGE_KEY}_sortBy`, sortBy);
  }, [sortBy]);

  useEffect(() => {
    sessionStorage.setItem(`${STORAGE_KEY}_sortDir`, sortDirection);
  }, [sortDirection]);

  useEffect(() => {
    sessionStorage.setItem(`${STORAGE_KEY}_adult`, String(includeAdult));
  }, [includeAdult]);

  useEffect(() => {
    sessionStorage.setItem(`${STORAGE_KEY}_query`, searchQuery);
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const sortKey =
    `${sortBy.toUpperCase()}_${sortDirection}` as keyof typeof UserMediaEntrySortOptions;
  const sortOrder = UserMediaEntrySortOptions[sortKey];

  const {
    data,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useGetUserMediaEntriesPaginated({
    mediaType: selectedType,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    isFavorite: isFavorite,
    sortBy: sortBy,
    sortOrder: sortOrder,
    titleSearch: debouncedSearchQuery || undefined,
    isAdult: includeAdult ? 'true' : 'false',
    page: 1,
    perPage: 20,
  });

  const entries = data?.pages?.flatMap((page) => page.results) ?? [];

  const mediaTypes: MediaType[] = [
    MediaType.ANIME,
    MediaType.MANGA,
    MediaType.MOVIE,
    MediaType.TV,
  ];

  const statuses: (UserMediaEntryStatus | 'all')[] = [
    'all',
    UserMediaEntryStatus.CURRENT,
    UserMediaEntryStatus.COMPLETED,
    UserMediaEntryStatus.ON_HOLD,
    UserMediaEntryStatus.DROPPED,
    UserMediaEntryStatus.PLANNING,
  ];

  const statusLabels: Record<UserMediaEntryStatus | 'all', string> = {
    all: 'All',
    [UserMediaEntryStatus.CURRENT]: 'Current',
    [UserMediaEntryStatus.COMPLETED]: 'Completed',
    [UserMediaEntryStatus.ON_HOLD]: 'On Hold',
    [UserMediaEntryStatus.DROPPED]: 'Dropped',
    [UserMediaEntryStatus.PLANNING]: 'Planning',
  };

  const sortOptions = [
    { value: UserMediaEntrySortFields.CREATED_AT, label: 'Date Added' },
    { value: UserMediaEntrySortFields.UPDATED_AT, label: 'Last Updated' },
    { value: UserMediaEntrySortFields.TITLE, label: 'Title' },
  ];

  const statusTabAccent: Record<UserMediaEntryStatus | 'all', string> = {
    all: 'bg-linear-to-r from-purple-500 to-pink-500',
    [UserMediaEntryStatus.CURRENT]: 'bg-blue-500',
    [UserMediaEntryStatus.COMPLETED]: 'bg-green-500',
    [UserMediaEntryStatus.ON_HOLD]: 'bg-orange-500',
    [UserMediaEntryStatus.DROPPED]: 'bg-red-500',
    [UserMediaEntryStatus.PLANNING]: 'bg-yellow-500',
  };

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
  };

  const openDetails = (externalId: number, mediaType: MediaType) => {
    navigate(`/${mediaType.toLowerCase()}/${externalId}`);
  };

  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
  });

  const handleClearFilters = () => {
    setSelectedStatus('all');
    setIsFavorite(undefined);
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setIncludeAdult(false);
  };

  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      setSelectedStatus('all');
      setIsFavorite(undefined);
      setSearchQuery('');
      setDebouncedSearchQuery('');
      setIncludeAdult(false);
    });
  }, [selectedType]);

  const hasActiveFilters =
    selectedStatus !== 'all' ||
    isFavorite !== undefined ||
    searchQuery ||
    includeAdult;

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-b from-zinc-900 via-black to-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-medium text-white mb-2">
            Please sign in to view your library
          </p>
          <p className="text-zinc-400">
            You need to be logged in to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-900 via-black to-zinc-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-purple-600/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          {/* ── Media Type Header Bar ── */}
          <div className="border-b border-zinc-800 mb-20">
            <div className="flex items-center justify-center gap-0">
              {mediaTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`relative px-8 py-5 text-base font-bold transition-all duration-200 whitespace-nowrap shrink-0 ${
                    selectedType === type
                      ? 'text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                  {selectedType === type && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-purple-500 to-pink-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">
              My{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-500 to-purple-600">
                Library
              </span>
            </h1>
            <p className="text-zinc-400 text-base">
              Track and manage your media collection
            </p>
          </div>

          {/* Search Bar - Bigger */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative group flex-1">
              <div className="absolute inset-0 bg-linear-to-r from-purple-500 to-pink-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative flex items-center">
                <span className="absolute left-5 text-zinc-400 text-xl pointer-events-none">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder={`Search your ${selectedType} library...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-10 py-4 bg-zinc-800/80 backdrop-blur-xl border border-zinc-700 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-base"
                />
                <div className="absolute right-4 flex items-center gap-1.5">
                  {searchQuery !== debouncedSearchQuery && (
                    <div className="w-4 h-4 border-2 border-purple-500/50 border-t-purple-500 rounded-full animate-spin" />
                  )}
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setDebouncedSearchQuery('');
                      }}
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Status Filter — Browser Tab Style ── */}
          <div className="flex justify-center mb-8">
            <div className="flex items-end gap-0 border-b border-zinc-700">
              {statuses.map((status) => {
                const isActive = selectedStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`relative px-4 py-2.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap rounded-t-lg border-t border-l border-r -mb-px ${
                      isActive
                        ? 'bg-zinc-800 border-zinc-700 text-white z-10'
                        : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40'
                    }`}
                  >
                    {/* Colored top accent on active tab */}
                    {isActive && (
                      <span
                        className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-lg ${statusTabAccent[status]}`}
                      />
                    )}
                    {statusLabels[status]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Other Filters - Below status */}
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="flex-1 border-t border-zinc-700" />
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest px-4">
                More Filters
              </p>
              <div className="flex-1 border-t border-zinc-700" />
            </div>

            {hasActiveFilters && (
              <div className="absolute right-4 top-0">
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  Clear all ✕
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch gap-3 justify-center">
              {/* Sort By */}
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">
                  Sort By
                </label>
                <div className="relative group h-12">
                  <div className="absolute inset-0 bg-linear-to-r from-purple-500 to-pink-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as UserMediaEntrySortFields)
                    }
                    className="relative h-full w-full appearance-none pl-4 pr-9 bg-zinc-800/80 backdrop-blur-xl border border-zinc-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm cursor-pointer"
                  >
                    {sortOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-zinc-800"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none text-xs">
                    ▼
                  </span>
                </div>
              </div>

              {/* Sort Direction */}
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">
                  Order
                </label>
                <button
                  onClick={toggleSortDirection}
                  title={sortDirection === 'ASC' ? 'Ascending' : 'Descending'}
                  className="h-12 shrink-0 px-4 bg-zinc-800/80 backdrop-blur-xl border border-zinc-700 rounded-2xl text-zinc-300 hover:text-white hover:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 flex items-center gap-1.5 text-sm"
                >
                  {sortDirection === 'ASC' ? (
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                  <span className="sm:inline">
                    {sortDirection === 'ASC' ? 'Asc' : 'Desc'}
                  </span>
                </button>
              </div>

              {/* Favorites Toggle */}
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">
                  Favorites
                </label>
                <button
                  onClick={() =>
                    setIsFavorite(isFavorite === true ? undefined : true)
                  }
                  title="Favorites only"
                  className={`h-12 shrink-0 px-4 backdrop-blur-xl border rounded-2xl transition-all duration-200 flex items-center gap-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isFavorite === true
                      ? 'bg-pink-600/20 border-pink-500/50 text-pink-300'
                      : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-white hover:border-pink-500/50'
                  }`}
                >
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill={isFavorite === true ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span className="sm:inline">Favorites</span>
                </button>
              </div>

              {/* Adult Content Toggle */}
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">
                  Adult
                </label>
                <button
                  onClick={() => setIncludeAdult((prev) => !prev)}
                  title={
                    includeAdult
                      ? 'Showing adult only'
                      : 'Show adult content only'
                  }
                  className={`h-12 shrink-0 px-4 backdrop-blur-xl border rounded-2xl transition-all duration-200 flex items-center gap-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    includeAdult
                      ? 'bg-red-600/20 border-red-500/50 text-red-300'
                      : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-white hover:border-red-500/50'
                  }`}
                >
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="sm:inline">18+</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Pills */}
          {hasActiveFilters && (
            <div className="max-w-4xl mx-auto mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-zinc-500">Active:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-xs text-purple-300">
                    "{searchQuery}"
                    {searchQuery !== debouncedSearchQuery && (
                      <div className="w-2.5 h-2.5 border border-purple-400/50 border-t-purple-400 rounded-full animate-spin" />
                    )}
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setDebouncedSearchQuery('');
                      }}
                      className="hover:text-white ml-0.5"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {selectedStatus !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-600/20 border border-pink-500/30 rounded-full text-xs text-pink-300">
                    {statusLabels[selectedStatus]}
                    <button
                      onClick={() => setSelectedStatus('all')}
                      className="hover:text-white ml-0.5"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {isFavorite !== undefined && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-600/20 border border-pink-500/30 rounded-full text-xs text-pink-300">
                    ♥ Favorites
                    <button
                      onClick={() => setIsFavorite(undefined)}
                      className="hover:text-white ml-0.5"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {includeAdult && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600/20 border border-red-500/30 rounded-full text-xs text-red-300">
                    18+
                    <button
                      onClick={() => setIncludeAdult(false)}
                      className="hover:text-white ml-0.5"
                    >
                      ✕
                    </button>
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-zinc-500 hover:text-white transition-colors underline underline-offset-2"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {(isLoading || isFetching) && entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full" />
              <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
            </div>
            <p className="text-zinc-400 text-lg">Loading your library...</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-xl font-medium text-red-400 mb-2">
              Oops! Something went wrong
            </p>
            <p className="text-zinc-500">
              Unable to load your library. Please try again later.
            </p>
          </div>
        )}

        {!isLoading && !isError && entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="text-8xl mb-6 opacity-50">📭</div>
            <p className="text-2xl font-bold text-white mb-2">
              {debouncedSearchQuery
                ? 'No results found'
                : 'Your library is empty'}
            </p>
            <p className="text-zinc-400 text-center max-w-md mb-6">
              {debouncedSearchQuery
                ? `No ${selectedType} found matching "${debouncedSearchQuery}"`
                : `Start adding ${selectedType} to your library to track your progress.`}
            </p>
            {debouncedSearchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDebouncedSearchQuery('');
                }}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors text-sm"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={() => navigate(`/${selectedType.toLowerCase()}`)}
                className="px-6 py-2.5 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/25 text-sm"
              >
                Explore{' '}
                {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
              </button>
            )}
          </div>
        )}

        {!isLoading && !isError && entries.length > 0 && (
          <>
            <MediaGrid
              title=""
              mediaList={entries.map((entry) => ({
                id: entry.externalId,
                title: entry.title,
                coverImage: entry.coverImage,
                externalSource: entry.externalSource,
                mediaType: entry.mediaType,
              }))}
              onMediaClick={(id) => {
                const entry = entries.find((e) => e.externalId === id);
                if (entry) openDetails(id, entry.mediaType);
              }}
            />

            {hasNextPage && (
              <div
                ref={sentinelRef}
                className="flex items-center justify-center py-12"
              >
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                ) : (
                  <span className="text-zinc-500 text-sm">Scroll for more</span>
                )}
              </div>
            )}

            {!hasNextPage && (
              <div className="text-center py-12 border-t border-zinc-800 mt-8">
                <p className="text-lg font-medium text-zinc-300">
                  You've reached the end!
                </p>
                <p className="text-sm text-zinc-500 mt-1">
                  Showing all {entries.length} results
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
