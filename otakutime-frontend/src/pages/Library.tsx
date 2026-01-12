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
  const [selectedType, setSelectedType] = useState<MediaType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<
    UserMediaEntryStatus | 'all'
  >('all');
  const [sortBy, setSortBy] = useState<UserMediaEntrySortFields>(
    UserMediaEntrySortFields.CREATED_AT
  );
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');

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
    mediaType: selectedType === 'all' ? undefined : selectedType,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    sortBy: sortBy,
    sortOrder: sortOrder,
    page: 1,
    perPage: 20,
  });

  // Flatten all pages into a single array of entries
  const entries = data?.pages?.flatMap((page) => page.results) ?? [];

  const media: (MediaType | 'all')[] = [
    'all',
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
    //{ value: UserMediaEntrySortFields.RATING, label: 'Rating' },
  ];

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
  };

  const openDetails = (externalId: number, mediaType: MediaType) => {
    navigate(`/${mediaType}/${externalId}`);
  };

  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
  });

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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              My{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-600">
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
        <div className="bg-zinc-800/50 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-5">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Media Type Dropdown */}
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
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                  />
                </svg>
                Media Type
              </label>
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) =>
                    setSelectedType(e.target.value as MediaType | 'all')
                  }
                  className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-600/50 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all appearance-none cursor-pointer hover:border-zinc-500"
                >
                  {media.map((type) => (
                    <option key={type} value={type}>
                      {type === 'all'
                        ? 'All Types'
                        : type.charAt(0).toUpperCase() + type.slice(1)}
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
                      e.target.value as UserMediaEntryStatus | 'all'
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

          {/* Active Filters Pills */}
          {(selectedType !== 'all' || selectedStatus !== 'all') && (
            <div className="mt-5 pt-5 border-t border-zinc-700/50">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-zinc-400">Active filters:</span>
                {selectedType !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 border border-purple-500/30 rounded-full text-sm text-purple-300">
                    {selectedType.charAt(0).toUpperCase() +
                      selectedType.slice(1)}
                    <button
                      onClick={() => setSelectedType('all')}
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
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-600/20 border border-pink-500/30 rounded-full text-sm text-pink-300">
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
                <button
                  onClick={() => {
                    setSelectedType('all');
                    setSelectedStatus('all');
                  }}
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
            <p className="text-2xl font-bold text-white mb-2">
              Your library is empty
            </p>
            <p className="text-zinc-400 text-center max-w-md mb-6">
              Start adding media to your library to track your progress and
              build your collection.
            </p>
            <button
              onClick={() => navigate('/anime')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              Explore Media
            </button>
          </div>
        )}

        {/* Media Grid */}
        {!isLoading && !isError && entries.length > 0 && (
          <div>
            <div className="mb-6">
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
