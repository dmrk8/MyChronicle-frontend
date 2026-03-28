import { useState, useEffect, useRef, startTransition } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { MediaType } from '../../../constants/mediaConstants';
import { useSearchAnilist } from '../../../hooks/useAnilist';
import {
  ANILIST_SORT_OPTIONS,
  ANILIST_SEASONS,
  ANILIST_GENRES,
  ANILIST_AIRING_STATUS,
  ANILIST_PUBLISHING_STATUS,
  ANILIST_COUNTRIES,
  ANILIST_TAGS_BY_CATEGORY,
  ANILIST_TAG_CATEGORY_ORDER,
  formatStatusDisplay,
  type AnilistSortOptions,
  type AnilistSeason,
  type AnilistGenre,
  type AnilistAiringStatus,
  type AnilistPublishingStatus,
  type AnilistTag,
  ANILIST_ANIME_FORMATS,
  ANILIST_MANGA_FORMATS,
  ANILIST_SEASON_LABEL,
  ANILIST_YEAR_OPTIONS,
} from '../../../constants/anilistFilters';
import type {
  AnilistMediaType,
  SearchAnilistParams,
} from '../../../api/anilistApi';
import useSessionState from '../hooks/useSessionState';
import SearchResults from './SearchResults';
import SearchBar from './SearchBar';
import {
  MultiExcludeDropdown,
  SingleSelectDropdown,
} from '../../../components/ui/dropdowns';
import { ToggleButton } from '../../../components/ui/ToggleButton';
import {
  ActiveFilterChips,
  type ActiveChip,
} from '../../../components/ui/ActiveFilterChips';
import FilterHolder from './FilterHolder';

const STORAGE_KEY_PREFIX = 'searchAnilist';

const fuzzyMatch = (query: string, target: string): boolean => {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
};

const tagButtonLabel = (included: string[], excluded: string[]): string => {
  const total = included.length + excluded.length;
  if (total === 0) return 'Any';
  if (total === 1) return included[0] ?? `−${excluded[0]}`;
  return `${total} active`;
};

const getFormatOptions = (mediaType: MediaType) =>
  mediaType === MediaType.ANIME ? ANILIST_ANIME_FORMATS : ANILIST_MANGA_FORMATS;

// Key uses lowercase path to match what Header writes (searchAnilist_anime / searchAnilist_manga)
const getStorageKey = (mediaType: MediaType) =>
  `${STORAGE_KEY_PREFIX}_${mediaType.toLowerCase()}`;

const SearchAnilist = ({ mediaType }: { mediaType: MediaType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const storageKey = getStorageKey(mediaType);

  // ── Parse URL params on first mount (shareable links)
  // Only runs once — after this, state is the source of truth.
  const _urlInit = (() => {
    const FILTER_KEYS = [
      'q',
      'sort',
      'season',
      'year',
      'status',
      'genres',
      'genresExclude',
      'tags',
      'tagsExclude',
      'country',
      'adult',
      'format',
    ];
    if (!FILTER_KEYS.some((k) => searchParams.has(k))) return null;
    return {
      query: searchParams.get('q') ?? '',
      sort:
        (searchParams.get('sort') as AnilistSortOptions) ??
        ANILIST_SORT_OPTIONS.POPULARITY_DESC,
      season: (searchParams.get('season') ?? '') as AnilistSeason | '',
      year: searchParams.get('year')
        ? Number(searchParams.get('year'))
        : ('' as const),
      status: (searchParams.get('status') ?? '') as
        | AnilistAiringStatus
        | AnilistPublishingStatus
        | '',
      genres: searchParams.get('genres')
        ? (searchParams
            .get('genres')!
            .split(',')
            .filter(Boolean) as AnilistGenre[])
        : [],
      excludedGenres: searchParams.get('genresExclude')
        ? (searchParams
            .get('genresExclude')!
            .split(',')
            .filter(Boolean) as AnilistGenre[])
        : [],
      tags: searchParams.get('tags')
        ? searchParams.get('tags')!.split(',').filter(Boolean)
        : [],
      excludedTags: searchParams.get('tagsExclude')
        ? searchParams.get('tagsExclude')!.split(',').filter(Boolean)
        : [],
      country: searchParams.get('country') ?? '',
      adult: searchParams.get('adult') === '1',
      format: searchParams.get('format') ?? '',
    };
  })();

  // ── Filter state — persisted to sessionStorage automatically
  // If URL params were present on load, they override the stored value.
  const [sortBy, setSortBy] = useSessionState<AnilistSortOptions>(
    `${storageKey}_sort`,
    _urlInit?.sort ?? ANILIST_SORT_OPTIONS.POPULARITY_DESC,
  );
  const [selectedSeason, setSelectedSeason] = useSessionState<
    AnilistSeason | ''
  >(`${storageKey}_season`, _urlInit?.season ?? '');
  const [selectedYear, setSelectedYear] = useSessionState<number | ''>(
    `${storageKey}_year`,
    _urlInit?.year ?? '',
  );
  const [selectedStatus, setSelectedStatus] = useSessionState<
    AnilistAiringStatus | AnilistPublishingStatus | ''
  >(`${storageKey}_status`, _urlInit?.status ?? '');
  const [selectedGenres, setSelectedGenres] = useSessionState<AnilistGenre[]>(
    `${storageKey}_genres`,
    _urlInit?.genres ?? [],
  );
  const [excludedGenres, setExcludedGenres] = useSessionState<AnilistGenre[]>(
    `${storageKey}_genres_excluded`,
    _urlInit?.excludedGenres ?? [],
  );
  const [selectedTags, setSelectedTags] = useSessionState<string[]>(
    `${storageKey}_tags`,
    _urlInit?.tags ?? [],
  );
  const [excludedTags, setExcludedTags] = useSessionState<string[]>(
    `${storageKey}_tags_excluded`,
    _urlInit?.excludedTags ?? [],
  );
  const [selectedCountry, setSelectedCountry] = useSessionState<string>(
    `${storageKey}_country`,
    _urlInit?.country ?? '',
  );
  const [isAdult, setIsAdult] = useSessionState<boolean>(
    `${storageKey}_adult`,
    _urlInit?.adult ?? false,
  );
  const [selectedFormat, setSelectedFormat] = useSessionState<string>(
    `${storageKey}_format`,
    _urlInit?.format ?? '',
  );

  // ── Search query — plain useState because debounce is coupled to its effect ─
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (_urlInit?.query != null) return _urlInit.query;
    return sessionStorage.getItem(`${storageKey}_query`) ?? '';
  });
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useState<string>(searchQuery);

  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_query`, searchQuery);
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, storageKey]);

  // custom Tags dropdown with categories
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [showAdultTags, setShowAdultTags] = useState(false);
  const tagSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showTagDropdown) setTimeout(() => tagSearchRef.current?.focus(), 50);
    else setTimeout(() => setTagSearch(''), 0);
  }, [showTagDropdown]);

  // ── Apply filters from Header navigation
  useEffect(() => {
    if (!location.state?.filtersApplied || !location.state?.filters) return;

    const s = location.state.filters;

    startTransition(() => {
      setSearchQuery(s.query ?? '');
      setDebouncedSearchQuery(s.query ?? '');
      setSortBy(s.sort ?? ANILIST_SORT_OPTIONS.POPULARITY_DESC);
      setSelectedSeason(s.season ?? '');
      setSelectedYear(s.year ?? '');
      setSelectedStatus(s.status ?? '');
      setSelectedGenres(s.genres ?? []);
      setExcludedGenres(s.excludedGenres ?? []);
      setSelectedTags(s.tags ?? []);
      setExcludedTags(s.excludedTags ?? []);
      setSelectedCountry(s.country ?? '');
      setIsAdult(s.adult ?? false);
      setSelectedFormat(s.format ?? '');
    });

    window.history.replaceState({}, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.filtersApplied]);

  // Reset effect
  // No need to manually remove sessionStorage keys — setting state to defaults
  // triggers useSessionState's write effect, which overwrites them automatically.
  useEffect(() => {
    if (!location.state?.reset) return;

    const keysToRemove = [
      'query',
      'sort',
      'season',
      'year',
      'status',
      'genres',
      'tags',
      'country',
      'adult',
      'format',
      'genres_excluded',
      'tags_excluded',
    ];
    keysToRemove.forEach((key) =>
      sessionStorage.removeItem(`${storageKey}_${key}`),
    );

    startTransition(() => {
      setSearchQuery('');
      setDebouncedSearchQuery('');
      setSortBy(ANILIST_SORT_OPTIONS.POPULARITY_DESC);
      setSelectedSeason('');
      setSelectedYear('');
      setSelectedStatus('');
      setSelectedGenres([]);
      setSelectedTags([]);
      setSelectedCountry('');
      setIsAdult(false);
      setSelectedFormat('');
      setExcludedGenres([]);
      setExcludedTags([]);
    });
    window.history.replaceState({}, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.reset]);

  // ── Query params ───────────────────────────────────────────────────────────
  const isSearching = debouncedSearchQuery.trim().length > 0;
  const isAnime = mediaType === MediaType.ANIME;

  const anilistParams: SearchAnilistParams = {
    ...(isSearching && { search: debouncedSearchQuery }),
    mediaType: mediaType as AnilistMediaType,
    sort: sortBy,
    ...(selectedSeason && { season: selectedSeason }),
    ...(selectedYear && { seasonYear: selectedYear }),
    ...(selectedStatus && { status: selectedStatus }),
    ...(selectedGenres.length > 0 && { genreIn: selectedGenres }),
    ...(excludedGenres.length > 0 && { genreNotIn: excludedGenres }),
    ...(selectedTags.length > 0 && { tagIn: selectedTags }),
    ...(excludedTags.length > 0 && { tagNotIn: excludedTags }),
    ...(selectedCountry && { countryOfOrigin: selectedCountry }),
    isAdult,
    ...(selectedFormat && { format: selectedFormat }),
  };

  const {
    data: mediaData,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchAnilist(anilistParams, { enabled: true });

  const mediaResults = mediaData?.pages.flatMap((page) => page.results) ?? [];

  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    enabled: true,
  });

  const openDetails = (id: number) =>
    navigate(`/${mediaType.toLowerCase()}/${id}`);

  // ── Filter helpers ─────────────────────────────────────────────────────────

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      // selected → excluded
      setSelectedTags((prev) => prev.filter((t) => t !== tagName));
      setExcludedTags((prev) => [...prev, tagName]);
    } else if (excludedTags.includes(tagName)) {
      // excluded → none
      setExcludedTags((prev) => prev.filter((t) => t !== tagName));
    } else {
      // none → selected
      setSelectedTags((prev) => [...prev, tagName]);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSelectedSeason('');
    setSelectedYear('');
    setSelectedStatus('');
    setSelectedGenres([]);
    setExcludedGenres([]);
    setSelectedTags([]);
    setExcludedTags([]);
    setSelectedCountry('');
    setIsAdult(false);
    setSelectedFormat('');
  };

  const statusOptions = isAnime
    ? ANILIST_AIRING_STATUS
    : ANILIST_PUBLISHING_STATUS;

  const filteredTagsByCategory = Object.entries(ANILIST_TAGS_BY_CATEGORY)
    .sort(([a], [b]) => {
      const ai = ANILIST_TAG_CATEGORY_ORDER.indexOf(a);
      const bi = ANILIST_TAG_CATEGORY_ORDER.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .map(([category, tags]) => ({
      category,
      tags: (tags as AnilistTag[]).filter(
        (tag) =>
          (showAdultTags || !tag.isAdult) &&
          (!tagSearch || fuzzyMatch(tagSearch, tag.name)),
      ),
    }))
    .filter(({ tags }) => tags.length > 0);

  // ── Active chips ───────────────────────────────────────────────────────────
  const activeChips: ActiveChip[] = [
    ...(searchQuery || debouncedSearchQuery
      ? [
          {
            key: 'search',
            label: `"${searchQuery || debouncedSearchQuery}"`,
            loading: searchQuery !== debouncedSearchQuery,
            onRemove: () => {
              setSearchQuery('');
              setDebouncedSearchQuery('');
            },
          },
        ]
      : []),
    ...selectedGenres.map((g) => ({
      key: `genre-${g}`,
      label: g,
      onRemove: () => setSelectedGenres((prev) => prev.filter((x) => x !== g)),
      isExcluded: false,
    })),
    ...excludedGenres.map((g) => ({
      key: `genre-excluded-${g}`,
      label: `−${g}`,
      onRemove: () => setExcludedGenres((prev) => prev.filter((x) => x !== g)),
      isExcluded: true,
    })),
    ...selectedTags.map((t) => ({
      key: `tag-${t}`,
      label: t,
      onRemove: () => setSelectedTags((prev) => prev.filter((x) => x !== t)),
      isExcluded: false,
    })),
    ...excludedTags.map((t) => ({
      key: `tag-excluded-${t}`,
      label: `−${t}`,
      onRemove: () => setExcludedTags((prev) => prev.filter((x) => x !== t)),
      isExcluded: true,
    })),
    ...(selectedFormat
      ? [
          {
            key: 'format',
            label: selectedFormat
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            onRemove: () => setSelectedFormat(''),
          },
        ]
      : []),
    ...(selectedSeason
      ? [
          {
            key: 'season',
            label:
              selectedSeason.charAt(0) + selectedSeason.slice(1).toLowerCase(),
            onRemove: () => setSelectedSeason(''),
          },
        ]
      : []),
    ...(selectedYear
      ? [
          {
            key: 'year',
            label: String(selectedYear),
            onRemove: () => setSelectedYear(''),
          },
        ]
      : []),
    ...(selectedStatus
      ? [
          {
            key: 'status',
            label: formatStatusDisplay(selectedStatus),
            onRemove: () => setSelectedStatus(''),
          },
        ]
      : []),
    ...(selectedCountry
      ? [
          {
            key: 'country',
            label:
              ANILIST_COUNTRIES.find((c) => c.code === selectedCountry)?.name ??
              selectedCountry,
            onRemove: () => setSelectedCountry(''),
          },
        ]
      : []),
    ...(isAdult
      ? [{ key: 'adult', label: '18+', onRemove: () => setIsAdult(false) }]
      : []),
  ];

  // ── Shared select styles ───────────────────────────────────────────────────
  const activeSelect = 'border-blue-500 text-white';
  const inactiveSelect = 'border-zinc-700 text-zinc-400';

  // ── Sort label helper ──────────────────────────────────────────────────────
  const sortLabel = (key: string) =>
    key
      .split('_')
      .map((w) => {
        if (w === 'DESC') return '↓';
        if (w === 'ASC') return '↑';
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join(' ');

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set('q', debouncedSearchQuery);
    params.set('sort', sortBy);
    if (selectedSeason) params.set('season', selectedSeason);
    if (selectedYear !== '') params.set('year', String(selectedYear));
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedGenres.length > 0)
      params.set('genres', selectedGenres.join(','));
    if (excludedGenres.length > 0)
      params.set('genresExclude', excludedGenres.join(','));
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (excludedTags.length > 0)
      params.set('tagsExclude', excludedTags.join(','));
    if (selectedCountry) params.set('country', selectedCountry);
    if (isAdult) params.set('adult', '1');
    if (selectedFormat) params.set('format', selectedFormat);
    setSearchParams(params, { replace: true });
  }, [
    debouncedSearchQuery,
    sortBy,
    selectedSeason,
    selectedYear,
    selectedStatus,
    selectedGenres,
    excludedGenres,
    selectedTags,
    excludedTags,
    selectedCountry,
    isAdult,
    selectedFormat,
    setSearchParams,
  ]);

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-900 via-black to-zinc-900">
      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        mediaType={mediaType}
      />

      {/* Filters*/}
      <FilterHolder>
        <div className="flex items-center justify-between mb-3 pl-1">
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">
            Filters
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4 flex-wrap">
            <SingleSelectDropdown<AnilistSortOptions>
              label="Sort By"
              value={sortBy}
              onChange={(value) => setSortBy(value as AnilistSortOptions)}
              options={Object.entries(ANILIST_SORT_OPTIONS).map(
                ([key, val]) => ({
                  value: val,
                  label: sortLabel(key),
                }),
              )}
              placeholder="Any"
              searchable={false}
              allowClear={false}
            />

            <MultiExcludeDropdown
              label="Genre"
              included={selectedGenres}
              excluded={excludedGenres}
              onIncludedChange={(genres) =>
                setSelectedGenres(genres as AnilistGenre[])
              }
              onExcludedChange={(genres) =>
                setExcludedGenres(genres as AnilistGenre[])
              }
              options={[...ANILIST_GENRES]}
              placeholder="Any"
              searchable={true}
            />

            {/* ── Tags ── */}
            <div className="flex flex-col gap-1 shrink-0">
              <label className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">
                Tags
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTagDropdown((prev) => !prev)}
                  className={`relative flex items-center gap-2 pl-3.5 pr-9 py-2.5 bg-zinc-950 border rounded-xl text-sm cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition-all duration-150 w-45 ${
                    selectedTags.length > 0
                      ? activeSelect
                      : excludedTags.length > 0
                        ? 'border-red-500 text-white'
                        : inactiveSelect
                  }`}
                  aria-haspopup="listbox"
                  aria-expanded={showTagDropdown}
                >
                  {tagButtonLabel(selectedTags, excludedTags)}
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs pointer-events-none">
                    ▼
                  </span>
                </button>
                {showTagDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowTagDropdown(false)}
                    />
                    <div className="fixed left-1/2 -translate-x-1/2 top-[8%] z-50 w-[min(96vw,1000px)] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col max-h-[82vh]">
                      {/* Header */}
                      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-700/70 shrink-0">
                        <span className="text-sm font-semibold text-white">
                          Select Tags
                        </span>
                        {(selectedTags.length > 0 ||
                          excludedTags.length > 0) && (
                          <button
                            onClick={() => {
                              setSelectedTags([]);
                              setExcludedTags([]);
                            }}
                            className="text-xs text-zinc-400 hover:text-white transition-colors"
                          >
                            Clear {selectedTags.length + excludedTags.length}{' '}
                            active
                          </button>
                        )}
                      </div>

                      {/* Search + Adult toggle */}
                      <div className="px-4 py-3 border-b border-zinc-700/70 flex items-center gap-4 shrink-0">
                        <input
                          ref={tagSearchRef}
                          type="text"
                          placeholder="Search tags..."
                          value={tagSearch}
                          onChange={(e) => setTagSearch(e.target.value)}
                          className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                          <input
                            type="checkbox"
                            checked={showAdultTags}
                            onChange={(e) => setShowAdultTags(e.target.checked)}
                            className="accent-blue-500 w-4 h-4"
                          />
                          <span className="text-xs text-zinc-400 whitespace-nowrap">
                            Show 18+ tags
                          </span>
                        </label>
                      </div>

                      {/* Selected tags chips */}
                      {(selectedTags.length > 0 || excludedTags.length > 0) && (
                        <div className="px-4 py-2.5 border-b border-zinc-700/70 shrink-0 flex flex-wrap gap-1.5">
                          {selectedTags.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/15 border border-blue-500/40 text-blue-300 text-xs rounded-lg"
                            >
                              {t}
                              <button
                                onClick={() =>
                                  setSelectedTags((prev) =>
                                    prev.filter((x) => x !== t),
                                  )
                                }
                                className="text-blue-400 hover:text-white transition-colors leading-none ml-0.5"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                          {excludedTags.map((t) => (
                            <span
                              key={`exc-${t}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/15 border border-red-500/40 text-red-300 text-xs rounded-lg"
                            >
                              <span className="text-red-400 font-bold mr-0.5">
                                −
                              </span>
                              {t}
                              <button
                                onClick={() =>
                                  setExcludedTags((prev) =>
                                    prev.filter((x) => x !== t),
                                  )
                                }
                                className="text-red-400 hover:text-white transition-colors leading-none ml-0.5"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* All tags grouped by category */}
                      <div className="flex-1 overflow-y-auto p-4">
                        {filteredTagsByCategory.length === 0 ? (
                          <p className="text-center py-12 text-sm text-zinc-500">
                            No matches
                          </p>
                        ) : (
                          <div className="flex flex-col gap-4">
                            {filteredTagsByCategory.map(
                              ({ category, tags }) => {
                                const selectedInCategory = tags.filter(
                                  (t) =>
                                    selectedTags.includes(t.name) ||
                                    excludedTags.includes(t.name),
                                ).length;
                                return (
                                  <div
                                    key={category}
                                    className="border border-zinc-700/60 rounded-xl overflow-hidden"
                                  >
                                    {/* Category header */}
                                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/70 border-b border-zinc-700/60">
                                      <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                                        {category}
                                      </span>
                                      {selectedInCategory > 0 && (
                                        <span className="px-1.5 py-0.5 bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs rounded-md">
                                          {selectedInCategory} selected
                                        </span>
                                      )}
                                    </div>

                                    {/* Tags grid */}
                                    <div
                                      className="p-2 grid gap-1"
                                      style={{
                                        gridTemplateColumns:
                                          'repeat(auto-fill, minmax(140px, 1fr))',
                                      }}
                                    >
                                      {tags.map((tag) => {
                                        const isSelected =
                                          selectedTags.includes(tag.name);
                                        const isExcluded =
                                          excludedTags.includes(tag.name);

                                        return (
                                          <div
                                            key={tag.id}
                                            className="relative group"
                                          >
                                            <button
                                              type="button"
                                              onClick={() =>
                                                toggleTag(tag.name)
                                              }
                                              className={`w-full min-w-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left transition-all duration-150 border text-xs relative group ${
                                                isSelected
                                                  ? 'bg-blue-500/15 border-blue-500/50 text-blue-200'
                                                  : isExcluded
                                                    ? 'bg-red-500/15 border-red-500/50 text-red-200'
                                                    : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:bg-zinc-700/60 hover:text-white hover:border-zinc-600'
                                              }`}
                                            >
                                              <span
                                                className={`w-3 h-3 rounded border shrink-0 flex items-center justify-center transition-colors ${
                                                  isSelected
                                                    ? 'bg-blue-500 border-blue-500'
                                                    : isExcluded
                                                      ? 'bg-red-500 border-red-500'
                                                      : 'border-zinc-600'
                                                }`}
                                                aria-hidden="true"
                                              >
                                                {isSelected && (
                                                  <svg
                                                    className="w-2 h-2 text-white"
                                                    fill="currentColor"
                                                    viewBox="0 0 12 12"
                                                  >
                                                    <path
                                                      d="M10 3L5 8.5 2 5.5"
                                                      stroke="currentColor"
                                                      strokeWidth="1.5"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      fill="none"
                                                    />
                                                  </svg>
                                                )}
                                                {isExcluded && (
                                                  <svg
                                                    className="w-2 h-2 text-white"
                                                    fill="currentColor"
                                                    viewBox="0 0 12 12"
                                                  >
                                                    <path
                                                      d="M2 6h8"
                                                      stroke="currentColor"
                                                      strokeWidth="2"
                                                      strokeLinecap="round"
                                                    />
                                                  </svg>
                                                )}
                                              </span>
                                              <span className="truncate flex-1">
                                                {tag.name}
                                              </span>
                                              {tag.isAdult && (
                                                <span className="text-red-400 shrink-0">
                                                  18+
                                                </span>
                                              )}
                                            </button>

                                            {tag.description && (
                                              <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 w-52 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                                <p className="text-xs font-medium text-white mb-1">
                                                  {tag.name}
                                                </p>
                                                <p className="text-xs text-zinc-400 leading-relaxed">
                                                  {tag.description}
                                                </p>
                                                {tag.isAdult && (
                                                  <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-red-500/15 text-red-300 rounded-md">
                                                    18+ only
                                                  </span>
                                                )}
                                                <div className="absolute -bottom-1.25 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 border-r border-b border-zinc-700 rotate-45" />
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-700/70 shrink-0">
                        <span className="text-xs text-zinc-500">
                          {selectedTags.length > 0
                            ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`
                            : 'No tags selected'}
                        </span>
                        <button
                          onClick={() => setShowTagDropdown(false)}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── Format ── */}
            <SingleSelectDropdown
              label="Format"
              value={selectedFormat}
              onChange={(value) => setSelectedFormat(value)}
              options={getFormatOptions(mediaType).map((format) => ({
                value: format,
                label: format
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase()),
              }))}
              placeholder="Any"
              searchable={false}
              allowClear={true}
            />

            {/* ── Season (anime only) ── */}
            {isAnime && (
              <SingleSelectDropdown<AnilistSeason>
                label="Season"
                value={selectedSeason}
                onChange={(value) =>
                  setSelectedSeason(value as AnilistSeason | '')
                }
                options={ANILIST_SEASONS.map((season) => ({
                  value: season,
                  label: ANILIST_SEASON_LABEL[season],
                }))}
                placeholder="Any"
                searchable={false}
                allowClear={true}
              />
            )}

            {/* ── Year ── */}
            <SingleSelectDropdown
              label="Year"
              value={selectedYear ? String(selectedYear) : ''}
              onChange={(value) => setSelectedYear(value ? Number(value) : '')}
              options={ANILIST_YEAR_OPTIONS.map((year) => ({
                value: String(year),
                label: String(year),
              }))}
              placeholder="Any"
              searchable={true}
              allowClear={true}
            />

            {/* ── Status ── */}
            <SingleSelectDropdown
              label={isAnime ? 'Airing Status' : 'Publishing Status'}
              value={selectedStatus}
              onChange={(value) =>
                setSelectedStatus(value as typeof selectedStatus)
              }
              options={statusOptions.map((status) => ({
                value: status,
                label: formatStatusDisplay(status),
              }))}
              placeholder="Any"
              searchable={false}
              allowClear={true}
            />

            {/* ── Country ── */}
            <SingleSelectDropdown
              label="Country"
              value={selectedCountry}
              onChange={(value) => setSelectedCountry(value)}
              options={ANILIST_COUNTRIES.map((country) => ({
                value: country.code,
                label: country.name,
              }))}
              placeholder="Any"
              searchable={false}
              allowClear={true}
            />

            {/* ── Adult ── */}
            <ToggleButton
              label="Adult"
              selected={isAdult}
              onChange={setIsAdult}
              text="18+"
            />
          </div>
          <ActiveFilterChips chips={activeChips} onClearAll={clearFilters} />
        </div>
      </FilterHolder>

      {/* Results */}
      <SearchResults
        mediaResults={mediaResults}
        isFetching={isFetching}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        sentinelRef={sentinelRef}
        onMediaClick={openDetails}
      />
    </div>
  );
};

export default SearchAnilist;
