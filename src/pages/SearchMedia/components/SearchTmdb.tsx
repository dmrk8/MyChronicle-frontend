import { useState, useEffect, useRef, startTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import MediaGrid from '../../../components/MediaGrid';
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
} from '../../../constants/tmdbFilters';
import type {
  SearchTmdbMovieParams,
  SearchTmdbTvParams,
} from '../../../api/tmdbApi';
import { useSearchTmdbMovie, useSearchTmdbTv } from '../../../hooks/useTmdb';

const STORAGE_KEY_PREFIX = 'searchTmdb';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR + 2 - 1900 },
  (_, i) => CURRENT_YEAR + 1 - i,
);

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

const genreButtonLabel = (genres: TmdbGenre[]): string => {
  if (genres.length === 0) return 'Any';
  if (genres.length === 1) return genres[0].name;
  return `${genres[0].name} +${genres.length - 1}`;
};

// storageKey uses lowercase path to match what Header writes (searchTmdb_movie)
const getStorageKey = (mediaType: MediaType) =>
  `${STORAGE_KEY_PREFIX}_${mediaType.toLowerCase()}`;

const SearchTmdb = ({ mediaType }: { mediaType: MediaType }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const storageKey = getStorageKey(mediaType);
  const isMovie = mediaType === MediaType.MOVIE;
  const genreOptions = isMovie ? TMDB_MOVIE_GENRES : TMDB_TV_GENRES;
  const sortOptions = isMovie ? TMDB_MOVIE_SORT_OPTIONS : TMDB_TV_SORT_OPTIONS;

  // ── Helper to read all filters from sessionStorage ─────────────────────────
  const readStorage = () => ({
    query: sessionStorage.getItem(`${storageKey}_query`) ?? '',
    sort:
      (sessionStorage.getItem(`${storageKey}_sort`) as TmdbSortOption) ??
      TMDB_MOVIE_SORT_OPTIONS.POPULARITY_DESC,
    genres: (() => {
      const v = sessionStorage.getItem(`${storageKey}_genres`);
      return v ? (JSON.parse(v) as TmdbGenre[]) : [];
    })(),
    year: (() => {
      const v = sessionStorage.getItem(`${storageKey}_year`);
      return v ? Number(v) : ('' as const);
    })(),
    status: sessionStorage.getItem(`${storageKey}_status`) ?? '',
    language: sessionStorage.getItem(`${storageKey}_language`) ?? '',
    minRating: (() => {
      const v = sessionStorage.getItem(`${storageKey}_minRating`);
      return v ? Number(v) : ('' as const);
    })(),
    runtimeMin: (() => {
      const v = sessionStorage.getItem(`${storageKey}_runtimeMin`);
      return v ? Number(v) : 0;
    })(),
    runtimeMax: (() => {
      const v = sessionStorage.getItem(`${storageKey}_runtimeMax`);
      return v ? Number(v) : 360;
    })(),
    runtimeEnabled:
      sessionStorage.getItem(`${storageKey}_runtimeEnabled`) === 'true',
    // Header now writes dateFrom / dateTo directly — single key, no fallback needed
    dateFrom: sessionStorage.getItem(`${storageKey}_dateFrom`) ?? '',
    dateTo: sessionStorage.getItem(`${storageKey}_dateTo`) ?? '',
  });

  const [searchQuery, setSearchQuery] = useState<string>(
    () => readStorage().query,
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>(
    () => readStorage().query,
  );
  const [sortBy, setSortBy] = useState<TmdbSortOption>(
    () => readStorage().sort,
  );
  const [selectedGenres, setSelectedGenres] = useState<TmdbGenre[]>(
    () => readStorage().genres,
  );
  const [selectedYear, setSelectedYear] = useState<number | ''>(
    () => readStorage().year,
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(
    () => readStorage().status,
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    () => readStorage().language,
  );
  const [minRating, setMinRating] = useState<number | ''>(
    () => readStorage().minRating,
  );
  const [runtimeMin, setRuntimeMin] = useState<number>(
    () => readStorage().runtimeMin,
  );
  const [runtimeMax, setRuntimeMax] = useState<number>(
    () => readStorage().runtimeMax,
  );
  const [runtimeEnabled, setRuntimeEnabled] = useState<boolean>(
    () => readStorage().runtimeEnabled,
  );
  const [dateFrom, setDateFrom] = useState<string>(
    () => readStorage().dateFrom,
  );
  const [dateTo, setDateTo] = useState<string>(() => readStorage().dateTo);

  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [genreSearch, setGenreSearch] = useState('');
  const [genreDropdownIndex, setGenreDropdownIndex] = useState<number>(-1);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [yearSearch, setYearSearch] = useState('');
  const [yearDropdownIndex, setYearDropdownIndex] = useState<number>(-1);

  const genreSearchRef = useRef<HTMLInputElement>(null);
  const yearSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showGenreDropdown)
      setTimeout(() => genreSearchRef.current?.focus(), 50);
    else setTimeout(() => setGenreSearch(''), 0);
  }, [showGenreDropdown]);

  useEffect(() => {
    if (showYearDropdown) setTimeout(() => yearSearchRef.current?.focus(), 50);
    else
      setTimeout(() => {
        setYearSearch('');
        setYearDropdownIndex(-1);
      }, 0);
  }, [showYearDropdown]);

  // ── Apply filters from Header navigation ──────────────────────────────────
  useEffect(() => {
    if (!location.state?.filtersApplied) return;

    const s = readStorage();
    startTransition(() => {
      setSearchQuery(s.query);
      setDebouncedSearchQuery(s.query);
      setSortBy(s.sort);
      setSelectedGenres(s.genres);
      setSelectedYear(s.year);
      setSelectedStatus(s.status);
      setSelectedLanguage(s.language);
      setMinRating(s.minRating);
      setRuntimeMin(s.runtimeMin);
      setRuntimeMax(s.runtimeMax);
      setRuntimeEnabled(s.runtimeEnabled);
      setDateFrom(s.dateFrom);
      setDateTo(s.dateTo);
    });

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
    });
    window.history.replaceState({}, '');
  }, [location.state?.reset]);

  // ── Persist to sessionStorage ──────────────────────────────────────────────
  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_query`, searchQuery);
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, storageKey]);
  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_sort`, sortBy);
  }, [sortBy, storageKey]);
  useEffect(() => {
    sessionStorage.setItem(
      `${storageKey}_genres`,
      JSON.stringify(selectedGenres),
    );
  }, [selectedGenres, storageKey]);
  useEffect(() => {
    sessionStorage.setItem(
      `${storageKey}_year`,
      selectedYear !== '' ? String(selectedYear) : '',
    );
  }, [selectedYear, storageKey]);
  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_status`, selectedStatus);
  }, [selectedStatus, storageKey]);
  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_language`, selectedLanguage);
  }, [selectedLanguage, storageKey]);
  useEffect(() => {
    sessionStorage.setItem(
      `${storageKey}_minRating`,
      minRating !== '' ? String(minRating) : '',
    );
  }, [minRating, storageKey]);
  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_runtimeMin`, String(runtimeMin));
    sessionStorage.setItem(`${storageKey}_runtimeMax`, String(runtimeMax));
    sessionStorage.setItem(
      `${storageKey}_runtimeEnabled`,
      String(runtimeEnabled),
    );
  }, [runtimeMin, runtimeMax, runtimeEnabled, storageKey]);
  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_dateFrom`, dateFrom);
  }, [dateFrom, storageKey]);
  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_dateTo`, dateTo);
  }, [dateTo, storageKey]);

  // ── Query params ───────────────────────────────────────────────────────────
  const isSearching = debouncedSearchQuery.trim().length > 0;

  const tmdbMovieParams: SearchTmdbMovieParams = {
    ...(isSearching && { search: debouncedSearchQuery }),
    sortBy,
    ...(selectedGenres.length > 0 && {
      withGenres: selectedGenres.map((g) => g.id).join(','),
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

  const hasActiveFilters =
    selectedGenres.length > 0 ||
    selectedYear !== '' ||
    selectedStatus !== '' ||
    selectedLanguage !== '' ||
    minRating !== '' ||
    runtimeEnabled ||
    dateFrom !== '' ||
    dateTo !== '';

  const clearFilters = () => {
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
  };

  const filteredGenres = [...genreOptions].filter((g) =>
    fuzzyMatch(genreSearch, g.name),
  );
  const filteredYears = YEAR_OPTIONS.filter((y) =>
    fuzzyMatch(yearSearch, String(y)),
  );

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [
    ...selectedGenres.map((g) => ({
      key: `genre-${g.id}`,
      label: g.name,
      onRemove: () => toggleGenre(g),
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

  const selectBase =
    'relative appearance-none pl-4 pr-10 py-3 bg-zinc-800/80 backdrop-blur-xl border rounded-xl text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200';
  const activeSelect = 'border-blue-500 text-white';
  const inactiveSelect = 'border-zinc-700 text-zinc-400';

  const handleGenreDropdownKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement | HTMLInputElement>,
  ) => {
    if (!showGenreDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setGenreDropdownIndex((p) => Math.min(p + 1, filteredGenres.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setGenreDropdownIndex((p) => Math.max(p - 1, 0));
    } else if (e.key === 'Escape') {
      setShowGenreDropdown(false);
    } else if (
      e.key === 'Enter' &&
      genreDropdownIndex >= 0 &&
      genreDropdownIndex < filteredGenres.length
    ) {
      e.preventDefault();
      toggleGenre(filteredGenres[genreDropdownIndex]);
    }
  };

  const handleYearDropdownKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement | HTMLInputElement>,
  ) => {
    if (!showYearDropdown) return;
    const totalItems = filteredYears.length + 1;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setYearDropdownIndex((p) => Math.min(p + 1, totalItems - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setYearDropdownIndex((p) => Math.max(p - 1, 0));
    } else if (e.key === 'Escape') {
      setShowYearDropdown(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (yearDropdownIndex === 0) {
        setSelectedYear('');
        setShowYearDropdown(false);
      } else if (
        yearDropdownIndex > 0 &&
        yearDropdownIndex <= filteredYears.length
      ) {
        setSelectedYear(filteredYears[yearDropdownIndex - 1]);
        setShowYearDropdown(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-900 via-black to-zinc-900">
      <div className="relative overflow-visible">
        <div className="absolute inset-0 bg-linear-to-b from-blue-600/10 via-transparent to-transparent pointer-events-none" />
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

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
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
          </div>

          {/* Filters */}
          <div className="max-w-3xl mx-auto mt-5">
            <div className="flex items-center justify-between mb-3 pl-1">
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">
                Filters
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  Clear all ✕
                </button>
              )}
            </div>

            <div className="flex items-start gap-4 flex-wrap">
              {/* ── Sort By ── */}
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">
                  Sort By
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as TmdbSortOption)
                    }
                    className={`${selectBase} ${inactiveSelect}`}
                  >
                    {Object.entries(sortOptions).map(([key, value]) => (
                      <option key={value} value={value} className="bg-zinc-800">
                        {key
                          .split('_')
                          .map((w) => {
                            if (w === 'DESC') return 'Descending';
                            if (w === 'ASC') return 'Ascending';
                            return (
                              w.charAt(0).toUpperCase() +
                              w.slice(1).toLowerCase()
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

              {/* ── Genres ── */}
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">
                  Genre
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowGenreDropdown((prev) => !prev)}
                    onKeyDown={handleGenreDropdownKeyDown}
                    className={`${selectBase} ${selectedGenres.length > 0 ? activeSelect : inactiveSelect}`}
                    aria-haspopup="listbox"
                    aria-expanded={showGenreDropdown}
                  >
                    {genreButtonLabel(selectedGenres)}
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs pointer-events-none">
                      ▼
                    </span>
                  </button>

                  {showGenreDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowGenreDropdown(false)}
                      />
                      <div className="absolute top-full mt-2 left-0 z-50 w-60 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl flex flex-col">
                        <div className="p-2 border-b border-zinc-700">
                          <input
                            ref={genreSearchRef}
                            type="text"
                            placeholder="Search genres..."
                            value={genreSearch}
                            onChange={(e) => setGenreSearch(e.target.value)}
                            onKeyDown={handleGenreDropdownKeyDown}
                            className="w-full px-3 py-2 bg-zinc-700 rounded-lg text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="max-h-72 overflow-y-auto" tabIndex={-1}>
                          {filteredGenres.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-zinc-500">
                              No matches
                            </p>
                          ) : (
                            filteredGenres.map((genre, idx) => (
                              <label
                                key={genre.id}
                                className={`flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-700 cursor-pointer transition-colors ${genreDropdownIndex === idx ? 'bg-blue-600/30' : ''}`}
                                tabIndex={-1}
                                onMouseEnter={() => setGenreDropdownIndex(idx)}
                                onClick={() => toggleGenre(genre)}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedGenres.some(
                                    (g) => g.id === genre.id,
                                  )}
                                  readOnly
                                  className="accent-blue-500 w-4 h-4 cursor-pointer"
                                />
                                <span className="text-sm text-white">
                                  {genre.name}
                                </span>
                              </label>
                            ))
                          )}
                        </div>
                        {selectedGenres.length > 0 && (
                          <div className="p-2 border-t border-zinc-700">
                            <button
                              onClick={() => setSelectedGenres([])}
                              className="w-full text-xs text-zinc-400 hover:text-white transition-colors py-1"
                            >
                              Clear {selectedGenres.length} selected
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ── Year ── */}
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">
                  Year
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowYearDropdown((prev) => !prev)}
                    onKeyDown={handleYearDropdownKeyDown}
                    className={`${selectBase} ${selectedYear ? activeSelect : inactiveSelect}`}
                  >
                    {selectedYear ? String(selectedYear) : 'Any'}
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs pointer-events-none">
                      ▼
                    </span>
                  </button>

                  {showYearDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowYearDropdown(false)}
                      />
                      <div className="absolute top-full mt-2 left-0 z-50 w-40 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl flex flex-col">
                        <div className="p-2 border-b border-zinc-700">
                          <input
                            ref={yearSearchRef}
                            type="text"
                            placeholder="Search year..."
                            value={yearSearch}
                            onChange={(e) => setYearSearch(e.target.value)}
                            onKeyDown={handleYearDropdownKeyDown}
                            className="w-full px-3 py-2 bg-zinc-700 rounded-lg text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          <button
                            onClick={() => {
                              setSelectedYear('');
                              setShowYearDropdown(false);
                            }}
                            onMouseEnter={() => setYearDropdownIndex(0)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 transition-colors ${yearDropdownIndex === 0 ? 'bg-blue-600/30' : ''} ${!selectedYear ? 'text-blue-400' : 'text-zinc-400'}`}
                          >
                            Any
                          </button>
                          {filteredYears.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-zinc-500">
                              No matches
                            </p>
                          ) : (
                            filteredYears.map((year, idx) => (
                              <button
                                key={year}
                                onClick={() => {
                                  setSelectedYear(year);
                                  setShowYearDropdown(false);
                                }}
                                onMouseEnter={() =>
                                  setYearDropdownIndex(idx + 1)
                                }
                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-700 transition-colors ${yearDropdownIndex === idx + 1 ? 'bg-blue-600/30' : ''} ${selectedYear === year ? 'text-blue-400 bg-zinc-700/50' : 'text-white'}`}
                              >
                                {year}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ── Status (TV only) ── */}
              {!isMovie && (
                <div className="flex flex-col gap-1 shrink-0">
                  <label className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">
                    Status
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className={`${selectBase} ${selectedStatus ? activeSelect : inactiveSelect}`}
                    >
                      <option value="" className="bg-zinc-800 text-zinc-400">
                        Any
                      </option>
                      {TMDB_TV_STATUSES.map((s) => (
                        <option
                          key={s.value}
                          value={s.value}
                          className="bg-zinc-800 text-white"
                        >
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none text-xs">
                      ▼
                    </span>
                  </div>
                </div>
              )}

              {/* ── Language ── */}
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">
                  Language
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className={`${selectBase} ${selectedLanguage ? activeSelect : inactiveSelect}`}
                  >
                    <option value="" className="bg-zinc-800 text-zinc-400">
                      Any
                    </option>
                    {TMDB_LANGUAGES.map((lang) => (
                      <option
                        key={lang.code}
                        value={lang.code}
                        className="bg-zinc-800 text-white"
                      >
                        {lang.name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none text-xs">
                    ▼
                  </span>
                </div>
              </div>

              {/* ── Date Range ── */}
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">
                  {isMovie ? 'Release Date' : 'Air Date'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      disabled={!!selectedYear}
                      title={
                        selectedYear
                          ? 'Clear the Year filter to use date range'
                          : ''
                      }
                      className={`relative pl-3 pr-3 py-3 bg-zinc-800/80 backdrop-blur-xl border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer scheme-dark ${dateFrom ? 'border-blue-500 text-white' : 'border-zinc-700 text-zinc-400'} ${selectedYear ? 'opacity-40 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  <span className="text-zinc-500 text-xs">to</span>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      disabled={!!selectedYear}
                      title={
                        selectedYear
                          ? 'Clear the Year filter to use date range'
                          : ''
                      }
                      className={`relative pl-3 pr-3 py-3 bg-zinc-800/80 backdrop-blur-xl border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer scheme-dark ${dateTo ? 'border-blue-500 text-white' : 'border-zinc-700 text-zinc-400'} ${selectedYear ? 'opacity-40 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>
              </div>

              {/* ── Runtime ── */}
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">
                  Runtime (min)
                </label>
                <div className="bg-zinc-800/80 backdrop-blur-xl border border-zinc-700 rounded-xl px-4 py-3 flex flex-col gap-2 min-w-55">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div
                        onClick={() => setRuntimeEnabled((prev) => !prev)}
                        className={`relative w-8 h-4 rounded-full transition-colors duration-200 cursor-pointer ${runtimeEnabled ? 'bg-blue-500' : 'bg-zinc-600'}`}
                      >
                        <div
                          className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 ${runtimeEnabled ? 'translate-x-4' : 'translate-x-0.5'}`}
                        />
                      </div>
                      <span
                        className={`text-xs ${runtimeEnabled ? 'text-white' : 'text-zinc-500'}`}
                      >
                        {runtimeEnabled
                          ? `${runtimeMin} – ${runtimeMax} min`
                          : 'Any'}
                      </span>
                    </label>
                  </div>

                  {runtimeEnabled && (
                    <div className="flex flex-col gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 text-xs w-6">Min</span>
                        <input
                          type="range"
                          min={0}
                          max={360}
                          step={5}
                          value={runtimeMin}
                          onChange={(e) =>
                            setRuntimeMin(
                              Math.min(Number(e.target.value), runtimeMax - 5),
                            )
                          }
                          className="flex-1 accent-blue-500 cursor-pointer"
                        />
                        <span className="text-white text-xs w-10 text-right">
                          {runtimeMin}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 text-xs w-6">Max</span>
                        <input
                          type="range"
                          min={0}
                          max={360}
                          step={5}
                          value={runtimeMax}
                          onChange={(e) =>
                            setRuntimeMax(
                              Math.max(Number(e.target.value), runtimeMin + 5),
                            )
                          }
                          className="flex-1 accent-blue-500 cursor-pointer"
                        />
                        <span className="text-white text-xs w-10 text-right">
                          {runtimeMax === 360 ? '360+' : runtimeMax}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Active Filter Chips ── */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {activeChips.map((chip) => (
                  <span
                    key={chip.key}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/15 border border-blue-500/40 text-blue-300 text-xs rounded-lg"
                  >
                    {chip.label}
                    <button
                      onClick={chip.onRemove}
                      className="text-blue-400 hover:text-white transition-colors leading-none"
                      aria-label={`Remove ${chip.label}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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

        {mediaResults.length > 0 && (
          <>
            <MediaGrid
              title=""
              mediaList={mediaResults}
              onMediaClick={openDetails}
            />
            {hasNextPage && (
              <div
                ref={sentinelRef}
                className="flex items-center justify-center py-12"
              >
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-3">
                    {[0, 150, 300].map((delay) => (
                      <div
                        key={delay}
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
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
                  Showing all {mediaResults.length} results
                </p>
              </div>
            )}
          </>
        )}

        {!isFetching && mediaResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="text-8xl mb-6 opacity-50">🔍</div>
            <p className="text-2xl font-bold text-white mb-2">
              No results found
            </p>
            <p className="text-zinc-400 text-center max-w-md">
              We couldn't find any {mediaType.toLowerCase()} matching your
              filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchTmdb;
