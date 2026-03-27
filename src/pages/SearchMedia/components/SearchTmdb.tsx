import { useState, useEffect, startTransition } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { MediaType } from '../../../constants/mediaConstants';
import {
  TMDB_MOVIE_SORT_OPTIONS,
  TMDB_TV_SORT_OPTIONS,
  TMDB_MOVIE_GENRES,
  TMDB_TV_GENRES,
  TMDB_TV_STATUSES,
  TMDB_LANGUAGES,
  type TmdbSortOption,
  type TmdbGenre,
  TMDB_YEAR_OPTIONS,
} from '../../../constants/tmdbFilters';
import type {
  SearchTmdbMovieParams,
  SearchTmdbTvParams,
} from '../../../api/tmdbApi';
import {
  useSearchTmdbMovie,
  useSearchTmdbTv,
  useTmdbKeywordSearch,
} from '../../../hooks/useTmdb';
import useSessionState from '../hooks/useSessionState';
import SearchResults from './SearchResults';
import SearchBar from './SearchBar';
import {
  MultiSelectDropdown,
  SingleSelectDropdown,
} from '../../../components/ui/dropdowns';
import {
  ActiveFilterChips,
  type ActiveChip,
} from '../../../components/ui/ActiveFilterChips';
import { DateRangeFilter } from '../../../components/ui/DaterangeFilter';
import { KeywordsFilter } from '../../../components/ui/KeywordsFilter';
const STORAGE_KEY_PREFIX = 'searchTmdb';

// storageKey uses lowercase path to match what Header writes (searchTmdb_movie)
const getStorageKey = (mediaType: MediaType) =>
  `${STORAGE_KEY_PREFIX}_${mediaType.toLowerCase()}`;

const SearchTmdb = ({ mediaType }: { mediaType: MediaType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const storageKey = getStorageKey(mediaType);
  const isMovie = mediaType === MediaType.MOVIE;
  const genreOptions = isMovie ? TMDB_MOVIE_GENRES : TMDB_TV_GENRES;
  const sortOptions = isMovie ? TMDB_MOVIE_SORT_OPTIONS : TMDB_TV_SORT_OPTIONS;

  // ── Parse URL params on first mount (shareable links)
  // Only runs once - after this, state is the source of truth
  const _urlInit = (() => {
    const FILTER_KEYS = [
      'q',
      'sort',
      'genres',
      'year',
      'status',
      'lang',
      'rating',
      'runtimeMin',
      'runtimeMax',
      'runtimeOn',
      'dateFrom',
      'dateTo',
      'kw',
    ];
    if (!FILTER_KEYS.some((k) => searchParams.has(k))) return null;

    const rawGenres = searchParams.get('genres');
    const genres = rawGenres
      ? rawGenres
          .split(',')
          .filter(Boolean)
          .map((g) => {
            const sep = g.indexOf(':');
            return {
              id: Number(g.slice(0, sep)),
              name: decodeURIComponent(g.slice(sep + 1)),
            } as TmdbGenre;
          })
      : ([] as TmdbGenre[]);

    const rawKw = searchParams.get('kw');
    const keywords: { id: number; name: string }[] = rawKw
      ? rawKw
          .split(',')
          .filter(Boolean)
          .map((k) => {
            const sep = k.indexOf(':');
            return {
              id: Number(k.slice(0, sep)),
              name: decodeURIComponent(k.slice(sep + 1)),
            };
          })
      : [];

    const runtimeOn = searchParams.get('runtimeOn') === '1';
    return {
      query: searchParams.get('q') ?? '',
      sort:
        (searchParams.get('sort') as TmdbSortOption) ??
        TMDB_MOVIE_SORT_OPTIONS.POPULARITY_DESC,
      genres,
      year: searchParams.get('year')
        ? Number(searchParams.get('year'))
        : ('' as const),
      status: searchParams.get('status') ?? '',
      language: searchParams.get('lang') ?? '',
      minRating: searchParams.get('rating')
        ? Number(searchParams.get('rating'))
        : ('' as const),
      runtimeMin: searchParams.get('runtimeMin')
        ? Number(searchParams.get('runtimeMin'))
        : 0,
      runtimeMax: searchParams.get('runtimeMax')
        ? Number(searchParams.get('runtimeMax'))
        : 360,
      runtimeEnabled: runtimeOn,
      dateFrom: searchParams.get('dateFrom') ?? '',
      dateTo: searchParams.get('dateTo') ?? '',
      keywords,
    };
  })();

  // If URL params were present on load, they override the stored value.
  const [sortBy, setSortBy] = useSessionState<TmdbSortOption>(
    `${storageKey}_sort`,
    _urlInit?.sort ?? TMDB_MOVIE_SORT_OPTIONS.POPULARITY_DESC,
  );
  const [selectedGenres, setSelectedGenres] = useSessionState<TmdbGenre[]>(
    `${storageKey}_genres`,
    _urlInit?.genres ?? [],
  );
  const [selectedYear, setSelectedYear] = useSessionState<number | ''>(
    `${storageKey}_year`,
    _urlInit?.year ?? '',
  );
  const [selectedStatus, setSelectedStatus] = useSessionState<string>(
    `${storageKey}_status`,
    _urlInit?.status ?? '',
  );
  const [selectedLanguage, setSelectedLanguage] = useSessionState<string>(
    `${storageKey}_language`,
    _urlInit?.language ?? '',
  );
  const [minRating, setMinRating] = useSessionState<number | ''>(
    `${storageKey}_minRating`,
    _urlInit?.minRating ?? '',
  );
  const [runtimeMin, setRuntimeMin] = useSessionState<number>(
    `${storageKey}_runtimeMin`,
    _urlInit?.runtimeMin ?? 0,
  );
  const [runtimeMax, setRuntimeMax] = useSessionState<number>(
    `${storageKey}_runtimeMax`,
    _urlInit?.runtimeMax ?? 360,
  );
  const [runtimeEnabled, setRuntimeEnabled] = useSessionState<boolean>(
    `${storageKey}_runtimeEnabled`,
    _urlInit?.runtimeEnabled ?? false,
  );
  const [dateFrom, setDateFrom] = useSessionState<string>(
    `${storageKey}_dateFrom`,
    _urlInit?.dateFrom ?? '',
  );
  const [dateTo, setDateTo] = useSessionState<string>(
    `${storageKey}_dateTo`,
    _urlInit?.dateTo ?? '',
  );
  const [selectedKeywords, setSelectedKeywords] = useSessionState<
    { id: number; name: string }[]
  >(`${storageKey}_keywords`, _urlInit?.keywords ?? []);

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

  // Keyword filter UI state
  const [keywordInput, setKeywordInput] = useState('');
  const [debouncedKeywordInput, setDebouncedKeywordInput] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeywordInput(keywordInput), 400);
    return () => clearTimeout(timer);
  }, [keywordInput]);

  // ── Apply filters from Header navigation
  useEffect(() => {
    if (!location.state?.filtersApplied || !location.state?.filters) return;

    const s = location.state.filters;

    startTransition(() => {
      setSearchQuery(s.query ?? '');
      setDebouncedSearchQuery(s.query ?? '');
      setSortBy(s.sort ?? TMDB_MOVIE_SORT_OPTIONS.POPULARITY_DESC);
      setSelectedGenres(s.genres ?? []);
      setSelectedYear(s.year ?? '');
      setSelectedStatus(s.status ?? '');
      setSelectedLanguage(s.language ?? '');
      setMinRating(s.minRating ?? '');
      setRuntimeMin(s.runtimeMin ?? 0);
      setRuntimeMax(s.runtimeMax ?? 360);
      setRuntimeEnabled(s.runtimeEnabled ?? false);
      setDateFrom(s.dateFrom ?? '');
      setDateTo(s.dateTo ?? '');
      setSelectedKeywords(s.keywords ?? []);
    });

    setSearchParams({}, { replace: true });
    window.history.replaceState({}, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.filtersApplied]);

  // ── Reset effect ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!location.state?.reset) return;
    startTransition(() => {
      setSearchQuery('');
      setDebouncedSearchQuery('');
      setSortBy(TMDB_MOVIE_SORT_OPTIONS.POPULARITY_DESC);
      setSelectedGenres([]);
      setSelectedYear('');
      setSelectedStatus('');
      setSelectedLanguage('');
      setMinRating('');
      setRuntimeMin(0);
      setRuntimeMax(360);
      setRuntimeEnabled(false);
      setDateFrom('');
      setDateTo('');
      setSelectedKeywords([]);
      setKeywordInput('');
    });
    window.history.replaceState({}, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.reset]);

  // ── Keyword search query ───────────────────────────────────────────────────
  const { data: keywordResults, isFetching: isFetchingKeywords } =
    useTmdbKeywordSearch(debouncedKeywordInput, {
      enabled: debouncedKeywordInput.trim().length >= 1,
    });

  const availableKeywords = (keywordResults ?? []).filter(
    (kw) => !selectedKeywords.some((s) => s.id === kw.id),
  );

  // ── Query params ───────────────────────────────────────────────────────────
  const isSearching = debouncedSearchQuery.trim().length > 0;

  const tmdbMovieParams: SearchTmdbMovieParams = {
    ...(isSearching && { search: debouncedSearchQuery }),
    sortBy,
    ...(selectedGenres.length > 0 && {
      withGenres: selectedGenres.map((g) => g.id).join(','),
    }),
    ...(selectedKeywords.length > 0 && {
      withKeywords: selectedKeywords.map((k) => k.id).join(','),
    }),
    ...(selectedYear && {
      primaryReleaseDateGte: `${selectedYear}-01-01`,
      primaryReleaseDateLte: `${selectedYear}-12-31`,
    }),
    ...(!selectedYear && dateFrom && { primaryReleaseDateGte: dateFrom }),
    ...(!selectedYear && dateTo && { primaryReleaseDateLte: dateTo }),
    ...(selectedLanguage && { withOriginalLanguage: selectedLanguage }),
    ...(minRating !== '' && { voteAverageGte: minRating }),
    ...(runtimeEnabled && {
      withRuntimeGte: runtimeMin,
      withRuntimeLte: runtimeMax,
    }),
  };

  const tmdbTvParams: SearchTmdbTvParams = {
    ...(isSearching && { search: debouncedSearchQuery }),
    sortBy,
    ...(selectedGenres.length > 0 && {
      withGenres: selectedGenres.map((g) => g.id).join(','),
    }),
    ...(selectedKeywords.length > 0 && {
      withKeywords: selectedKeywords.map((k) => k.id).join(','),
    }),
    ...(selectedYear && {
      firstAirDateGte: `${selectedYear}-01-01`,
      firstAirDateLte: `${selectedYear}-12-31`,
    }),
    ...(!selectedYear && dateFrom && { firstAirDateGte: dateFrom }),
    ...(!selectedYear && dateTo && { firstAirDateLte: dateTo }),
    ...(selectedLanguage && { withOriginalLanguage: selectedLanguage }),
    ...(minRating !== '' && { voteAverageGte: minRating }),
    ...(selectedStatus && { withStatus: selectedStatus }),
    ...(runtimeEnabled && {
      withRuntimeGte: runtimeMin,
      withRuntimeLte: runtimeMax,
    }),
  };

  const movieQuery = useSearchTmdbMovie(tmdbMovieParams, {
    enabled: mediaType === MediaType.MOVIE,
  });
  const tvQuery = useSearchTmdbTv(tmdbTvParams, {
    enabled: mediaType === MediaType.TV,
  });

  const {
    data: mediaData,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = mediaType === MediaType.MOVIE ? movieQuery : tvQuery;

  const mediaResults = mediaData?.pages.flatMap((page) => page.results) ?? [];

  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    enabled: true,
  });

  const openDetails = (id: number) =>
    navigate(`/${mediaType.toLowerCase()}/${id}`);

  const toggleGenre = (genre: TmdbGenre) => {
    setSelectedGenres((prev) =>
      prev.some((g) => g.id === genre.id)
        ? prev.filter((g) => g.id !== genre.id)
        : [...prev, genre],
    );
  };

  // ── Keyword helpers ────────────────────────────────────────────────────────
  const addKeyword = (kw: { id: number; name: string }) => {
    setSelectedKeywords((prev) =>
      prev.some((k) => k.id === kw.id) ? prev : [...prev, kw],
    );
    setKeywordInput('');
  };

  const removeKeyword = (id: number) => {
    setSelectedKeywords((prev) => prev.filter((k) => k.id !== id));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSelectedGenres([]);
    setSelectedYear('');
    setSelectedStatus('');
    setSelectedLanguage('');
    setMinRating('');
    setRuntimeMin(0);
    setRuntimeMax(360);
    setRuntimeEnabled(false);
    setDateFrom('');
    setDateTo('');
    setSelectedKeywords([]);
    setKeywordInput('');
  };

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
      key: `genre-${g.id}`,
      label: g.name,
      onRemove: () => toggleGenre(g),
    })),

    ...selectedKeywords.map((kw) => ({
      key: `keyword-${kw.id}`,
      label: `🏷 ${kw.name}`,
      onRemove: () => removeKeyword(kw.id),
    })),
    ...(selectedYear
      ? [
          {
            key: 'year',
            label: String(selectedYear),
            onRemove: () => setSelectedYear(''),
          },
        ]
      : []),
    ...(dateFrom
      ? [
          {
            key: 'dateFrom',
            label: `From: ${dateFrom}`,
            onRemove: () => setDateFrom(''),
          },
        ]
      : []),
    ...(dateTo
      ? [
          {
            key: 'dateTo',
            label: `To: ${dateTo}`,
            onRemove: () => setDateTo(''),
          },
        ]
      : []),
    ...(selectedStatus
      ? [
          {
            key: 'status',
            label:
              TMDB_TV_STATUSES.find((s) => s.value === selectedStatus)?.label ??
              selectedStatus,
            onRemove: () => setSelectedStatus(''),
          },
        ]
      : []),
    ...(selectedLanguage
      ? [
          {
            key: 'language',
            label:
              TMDB_LANGUAGES.find((l) => l.code === selectedLanguage)?.name ??
              selectedLanguage,
            onRemove: () => setSelectedLanguage(''),
          },
        ]
      : []),
    ...(minRating !== ''
      ? [
          {
            key: 'rating',
            label: `★ ${minRating}+`,
            onRemove: () => setMinRating(''),
          },
        ]
      : []),
    ...(runtimeEnabled
      ? [
          {
            key: 'runtime',
            label: `${runtimeMin}–${runtimeMax} min`,
            onRemove: () => {
              setRuntimeEnabled(false);
              setRuntimeMin(0);
              setRuntimeMax(360);
            },
          },
        ]
      : []),
  ];

  // ── Sync filter state to URL params (shareable links) ──────────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set('q', debouncedSearchQuery);
    params.set('sort', sortBy);
    if (selectedGenres.length > 0)
      params.set(
        'genres',
        selectedGenres
          .map((g) => `${g.id}:${encodeURIComponent(g.name)}`)
          .join(','),
      );
    if (selectedYear !== '') params.set('year', String(selectedYear));
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedLanguage) params.set('lang', selectedLanguage);
    if (minRating !== '') params.set('rating', String(minRating));
    if (runtimeEnabled) {
      params.set('runtimeMin', String(runtimeMin));
      params.set('runtimeMax', String(runtimeMax));
      params.set('runtimeOn', '1');
    }
    if (!selectedYear && dateFrom) params.set('dateFrom', dateFrom);
    if (!selectedYear && dateTo) params.set('dateTo', dateTo);
    if (selectedKeywords.length > 0)
      params.set(
        'kw',
        selectedKeywords
          .map((k) => `${k.id}:${encodeURIComponent(k.name)}`)
          .join(','),
      );
    setSearchParams(params, { replace: true });
    window.history.replaceState({}, '');
  }, [
    debouncedSearchQuery,
    sortBy,
    selectedGenres,
    selectedYear,
    selectedStatus,
    selectedLanguage,
    minRating,
    runtimeEnabled,
    runtimeMin,
    runtimeMax,
    dateFrom,
    dateTo,
    selectedKeywords,
    setSearchParams,
  ]);

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-900 via-black to-zinc-900">
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        mediaType={mediaType}
      />

      {/* Filters */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-3 pl-1">
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">
            Filters
          </p>
        </div>

        <div className="flex items-start gap-4 flex-wrap">
          {/* ── Sort By ── */}
          <SingleSelectDropdown
            label="Sort By"
            value={sortBy}
            onChange={(value) => setSortBy(value as TmdbSortOption)}
            options={Object.entries(sortOptions).map(([key, value]) => ({
              value,
              label: key
                .split('_')
                .map((w) => {
                  if (w === 'DESC') return 'Descending';
                  if (w === 'ASC') return 'Ascending';
                  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
                })
                .join(' '),
            }))}
            placeholder="Any"
            searchable={false}
            allowClear={false}
          />
          {/* ── Genres ── */}
          <MultiSelectDropdown<TmdbGenre>
            label="Genre"
            selected={selectedGenres}
            onChange={(genres: TmdbGenre[]) => setSelectedGenres(genres)}
            options={[...genreOptions]}
            getId={(genre) => genre.id}
            getLabel={(genre) => genre.name}
            placeholder="Any"
            searchable={true}
          />
          {/* ── Year ── */}
          <SingleSelectDropdown
            label="Year"
            value={selectedYear ? String(selectedYear) : ''}
            onChange={(value) => setSelectedYear(value ? Number(value) : '')}
            options={TMDB_YEAR_OPTIONS.map((year) => ({
              value: String(year),
              label: String(year),
            }))}
            placeholder="Any"
            searchable={true}
            allowClear={true}
          />
          {/* ── Status (TV only) ── */}
          {!isMovie && (
            <SingleSelectDropdown
              label="Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={TMDB_TV_STATUSES.map((s) => ({
                value: s.value,
                label: s.label,
              }))}
              placeholder="Any"
              searchable={false}
              allowClear={true}
            />
          )}
          {/* ── Language ── */}
          <SingleSelectDropdown
            label="Language"
            value={selectedLanguage}
            onChange={setSelectedLanguage}
            options={TMDB_LANGUAGES.map((lang) => ({
              value: lang.code,
              label: lang.name,
            }))}
            placeholder="Any"
            searchable={true}
            allowClear={true}
          />
          {/* ── Date Range ── */}
          <DateRangeFilter
            label={isMovie ? 'Release Date' : 'Air Date'}
            from={dateFrom}
            to={dateTo}
            onFromChange={setDateFrom}
            onToChange={setDateTo}
            disabled={!!selectedYear}
            disabledTitle="Clear the Year filter to use date range"
          />
          {/* ── Runtime ── */}
          {/* <RuntimeFilter
            enabled={runtimeEnabled}
            min={runtimeMin}
            max={runtimeMax}
            onToggle={() => setRuntimeEnabled((p) => !p)}
            onMinChange={setRuntimeMin}
            onMaxChange={setRuntimeMax}
          /> */}

          {/* ── Keywords ── */}
          <KeywordsFilter
            selected={selectedKeywords}
            suggestions={availableKeywords}
            isFetching={isFetchingKeywords}
            inputValue={keywordInput}
            onInputChange={setKeywordInput}
            onAdd={addKeyword}
            onRemove={removeKeyword}
          />
        </div>

        {/* ── Active Filter Chips ── */}
        <ActiveFilterChips chips={activeChips} onClearAll={clearFilters} />
      </div>

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

export default SearchTmdb;
