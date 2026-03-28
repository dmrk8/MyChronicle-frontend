import { useState, useEffect, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUserMediaEntriesPaginated } from '../hooks/useUserMediaEntry';
import {
  UserMediaEntryStatus,
  UserMediaEntrySortFields,
  UserMediaEntrySortOptions,
  sortFieldLabels,
  statusLabels,
} from '../types/UserMediaEntry';
import { MediaType } from '../constants/mediaConstants';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import SearchResults from './SearchMedia/components/SearchResults';
import { ToggleButton } from '../components/ui/ToggleButton';
import { SingleSelectDropdown } from '../components/ui/dropdowns';
import {
  ActiveFilterChips,
  type ActiveChip,
} from '../components/ui/ActiveFilterChips';
import SearchBar from '../components/ui/SearchBar';
import PageTitle from '../components/ui/PageTitle';
import PageHolder from '../components/PageHolder';

const STORAGE_KEY = 'library';

const LibraryPage = () => {
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

  const { data, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetUserMediaEntriesPaginated({
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

  // Create combined sort options once
  const combinedSortOptions = Object.entries(sortFieldLabels).flatMap(
    ([field, labels]) => [
      { value: `${field}_ASC`, label: labels.asc },
      { value: `${field}_DESC`, label: labels.desc },
    ],
  );

  // Helper to parse combined value back to separate states
  const handleSortChange = (value: string) => {
    const parts = value.split('_');
    const direction = parts.pop() as 'ASC' | 'DESC';
    const field = parts.join('_') as UserMediaEntrySortFields;

    setSortBy(field);
    setSortDirection(direction);
  };

  // Current sort value for display
  const currentSortValue = `${sortBy}_${sortDirection}`;

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

  const chips: ActiveChip[] = [
    ...(searchQuery
      ? [
          {
            key: 'search',
            label: `"${searchQuery}"`,
            variant: 'purple' as const,
            loading: searchQuery !== debouncedSearchQuery,
            onRemove: () => {
              setSearchQuery('');
              setDebouncedSearchQuery('');
            },
          },
        ]
      : []),
    ...(selectedStatus !== 'all'
      ? [
          {
            key: 'status',
            label: statusLabels[selectedStatus],
            variant: 'pink' as const,
            onRemove: () => setSelectedStatus('all'),
          },
        ]
      : []),
    ...(isFavorite !== undefined
      ? [
          {
            key: 'favorites',
            label: '♥ Favorites',
            variant: 'pink' as const,
            onRemove: () => setIsFavorite(undefined),
          },
        ]
      : []),
    ...(includeAdult
      ? [
          {
            key: 'adult',
            label: '18+',
            variant: 'red' as const,
            onRemove: () => setIncludeAdult(false),
          },
        ]
      : []),
  ];

  return (
    <PageHolder>
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-b from-purple-600/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          {/* ── Media Type Header Bar ── */}
          <div className="border-b border-zinc-800 mb-10">
            <div className="flex items-center overflow-x-auto sm:overflow-hidden scrollbar-none">
              {mediaTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`relative flex-1 min-w-fit px-6 py-5 text-base font-bold transition-all duration-200 whitespace-nowrap ${
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
          <PageTitle
            title="My"
            highlight="Library"
            subtitle="Track and manage your media collection"
            gradient="from-purple-400 via-pink-500 to-purple-600"
          />

          {/* Search Bar */}
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => {
              setSearchQuery('');
              setDebouncedSearchQuery('');
            }}
            mediaType={selectedType}
            accentColor="purple"
          />

          {/*Filters  */}
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="flex-1 border-t border-zinc-700" />
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest px-4">
                Filters
              </p>
              <div className="flex-1 border-t border-zinc-700" />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-3 justify-center overflow-visible">
              <SingleSelectDropdown
                label="Sort"
                value={currentSortValue}
                onChange={handleSortChange}
                options={combinedSortOptions}
                searchable={false}
                allowClear={false}
              />
              {/* Status Dropdown */}
              {selectedStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-600/20 border border-pink-500/30 rounded-full text-xs text-pink-300">
                  {(() => {
                    const status = selectedStatus as UserMediaEntryStatus;
                    return statusLabels[status];
                  })()}
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className="hover:text-white ml-0.5"
                  >
                    ✕
                  </button>
                </span>
              )}
              {/* Favorites Toggle */}
              <div className="flex flex-col gap-1 shrink-0">
                <ToggleButton
                  label="Favorites"
                  selected={isFavorite === true}
                  onChange={(selected) =>
                    setIsFavorite(selected ? true : undefined)
                  }
                  text={isFavorite === true ? '♥' : '♡'}
                />
              </div>

              {/* Adult Content Toggle */}
              <div className="flex flex-col gap-1 shrink-0">
                <ToggleButton
                  label="Adult"
                  selected={includeAdult}
                  onChange={(selected) => setIncludeAdult(selected)}
                  text={'18+'}
                />
              </div>
            </div>
          </div>

          {/* Active Filters Pills */}
          {hasActiveFilters && (
            <ActiveFilterChips chips={chips} onClearAll={handleClearFilters} />
          )}
        </div>
      </div>

      <SearchResults
        mediaResults={entries.map((entry) => ({
          id: entry.externalId,
          title: entry.title,
          coverImage: entry.coverImage,
          externalSource: entry.externalSource,
          mediaType: entry.mediaType,
        }))}
        isFetching={isFetching}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        sentinelRef={sentinelRef}
        onMediaClick={(id) => {
          const entry = entries.find((e) => e.externalId === id);
          if (entry) openDetails(id, entry.mediaType);
        }}
      />
    </PageHolder>
  );
};

export default LibraryPage;
