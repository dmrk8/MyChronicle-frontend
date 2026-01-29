import { useState } from 'react';
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

const LibraryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<MediaType>(MediaType.ANIME);
  const [selectedStatus, setSelectedStatus] = useState<
    UserMediaEntryStatus | 'all'
  >('all');
  const [isFavorite, setIsFavorite] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<UserMediaEntrySortFields>(
    UserMediaEntrySortFields.UPDATED_AT,
  );
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [searchQuery, setSearchQuery] = useState('');
  const [includeAdult, setIncludeAdult] = useState(false);

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
    titleSearch: searchQuery || undefined,
    isAdult: includeAdult ? undefined : 'false',
    page: 1,
    perPage: 20,
  });

  // Flatten all pages into a single array of entries
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
    setIncludeAdult(false);
  };

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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              My{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-500 to-purple-600">
                Library
              </span>
            </h1>
            <p className="text-zinc-400 text-lg">
              Track and manage your media collection
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-linear-to-br from-zinc-800/60 to-zinc-900/60 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <svg
              className="w-5 h-5 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-white">Filters</h3>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
              <svg
                className="w-4 h-4 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title..."
                className="w-full px-4 py-3 pl-11 bg-zinc-900/50 border border-zinc-600/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
              <svg
                className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
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

          {/* Media Type Pills */}
          <div className="space-y-2 mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <svg
                className="w-4 h-4 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                />
              </svg>
              Media Type
            </label>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
              {mediaTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 border ${
                    selectedType === type
                      ? 'bg-linear-to-r from-purple-600/40 to-pink-600/40 border-purple-500/60 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-zinc-900/50 border-zinc-600/50 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Dropdown */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <svg
                  className="w-4 h-4 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Status
              </label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(
                      e.target.value as UserMediaEntryStatus | 'all',
                    )
                  }
                  className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-600/50 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all appearance-none cursor-pointer hover:border-zinc-500"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
                <svg
                  className="w-5 h-5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
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
              </div>
            </div>

            {/* Favorites Toggle */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <svg
                  className="w-4 h-4 text-purple-400"
                  fill="none"
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
                Favorites
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFavorite(undefined)}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 border ${
                    isFavorite === undefined
                      ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                      : 'bg-zinc-900/50 border-zinc-600/50 text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setIsFavorite(true)}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 border flex items-center justify-center gap-2 ${
                    isFavorite === true
                      ? 'bg-linear-to-r from-pink-600/30 to-rose-600/30 border-pink-500/60 text-pink-300'
                      : 'bg-zinc-900/50 border-zinc-600/50 text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  <svg
                    className="w-5 h-5"
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
                  Favorites
                </button>
              </div>
            </div>

            {/* Sort By with Direction Toggle */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <svg
                  className="w-4 h-4 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
                Sort By
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as UserMediaEntrySortFields)
                    }
                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-600/50 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all appearance-none cursor-pointer hover:border-zinc-500"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="w-5 h-5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
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
                </div>
                <button
                  onClick={toggleSortDirection}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 border ${
                    sortDirection === 'DESC'
                      ? 'bg-purple-600/20 border-purple-500/50 text-purple-300 hover:bg-purple-600/30'
                      : 'bg-zinc-900/50 border-zinc-600/50 text-zinc-300 hover:border-zinc-500'
                  }`}
                  title={sortDirection === 'ASC' ? 'Ascending' : 'Descending'}
                >
                  {sortDirection === 'ASC' ? (
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
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  ) : (
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                  <span className="text-sm hidden sm:inline">
                    {sortDirection === 'ASC' ? 'Asc' : 'Desc'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Adult Content Checkbox */}
          <div className="mt-6 pt-6 border-t border-zinc-700/50">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={includeAdult}
                  onChange={(e) => setIncludeAdult(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700/50 rounded-full peer peer-checked:bg-linear-to-r peer-checked:from-purple-600 peer-checked:to-pink-600 transition-all duration-300 border border-zinc-600/50 peer-checked:border-purple-500/50"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-5 shadow-lg"></div>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-red-400"
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
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                  Include Adult Content (18+)
                </span>
              </div>
            </label>
          </div>

          {/* Active Filters Pills */}
          {(selectedStatus !== 'all' ||
            isFavorite !== undefined ||
            searchQuery ||
            includeAdult) && (
            <div className="mt-5 pt-5 border-t border-zinc-700/50">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-zinc-400">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-sm text-purple-300">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="hover:text-white transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
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
                  </span>
                )}
                {selectedStatus !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-pink-600/20 to-rose-600/20 border border-pink-500/30 rounded-full text-sm text-pink-300">
                    {statusLabels[selectedStatus]}
                    <button
                      onClick={() => setSelectedStatus('all')}
                      className="hover:text-white transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
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
                  </span>
                )}
                {isFavorite !== undefined && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-pink-600/20 to-rose-600/20 border border-pink-500/30 rounded-full text-sm text-pink-300">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Favorites Only
                    <button
                      onClick={() => setIsFavorite(undefined)}
                      className="hover:text-white transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
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
                  </span>
                )}
                {includeAdult && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-full text-sm text-red-300">
                    <svg
                      className="w-4 h-4"
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
                    Adult Content (18+)
                    <button
                      onClick={() => setIncludeAdult(false)}
                      className="hover:text-white transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
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
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
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
        {/* Loading State */}
        {(isLoading || isFetching) && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full" />
              <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
            </div>
            <p className="text-zinc-400 text-lg">Loading your library...</p>
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
              Unable to load your library. Please try again later.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 mb-6 rounded-full bg-linear-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white mb-2">
              {searchQuery ? 'No results found' : 'Your library is empty'}
            </p>
            <p className="text-zinc-400 text-center max-w-md mb-6">
              {searchQuery
                ? `No media found matching "${searchQuery}"`
                : 'Start adding media to your library to track your progress and build your collection.'}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={() => navigate('/anime')}
                className="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-purple-500/25"
              >
                Explore Media
              </button>
            )}
          </div>
        )}

        {/* Media Grid */}
        {!isLoading && !isError && entries.length > 0 && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
              </h2>
            </div>

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
                if (entry) {
                  openDetails(id, entry.mediaType);
                }
              }}
            />
          </div>
        )}
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
              <span className="text-zinc-500 text-sm">Scroll for more</span>
            )}
          </div>
        )}
        {/* End of Results */}
        {!hasNextPage && entries.length > 0 && (
          <div className="text-center py-12 border-t border-zinc-800 mt-8">
            <p className="text-lg font-medium text-zinc-300">
              You've reached the end!
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              Showing all {entries.length} results
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
