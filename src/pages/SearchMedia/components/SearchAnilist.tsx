import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import MediaGrid from '../../../components/MediaGrid';
import { MediaType } from '../../../constants/mediaConstants';
import { useSearchAnilist } from '../../../hooks/useAnilist';
import {
  ANILIST_SORT_OPTIONS,
  ANILIST_SEASONS,
  ANILIST_GENRES,
  ANILIST_AIRING_STATUS,
  ANILIST_PUBLISHING_STATUS,
  ANILIST_COUNTRIES,
  formatStatusDisplay,
  type AnilistSortOptions,
  type AnilistSeason,
  type AnilistGenre,
  type AnilistAiringStatus,
  type AnilistPublishingStatus,
  ANILIST_ANIME_FORMATS,
  ANILIST_MANGA_FORMATS
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

// Helper: render genre button label
const genreButtonLabel = (genres: AnilistGenre[]): string => {
  if (genres.length === 0) return 'Any';
  if (genres.length === 1) return genres[0];
  return `${genres[0]} +${genres.length - 1}`;
};

// Helper: get formats for current media type
const getFormatOptions = (mediaType: MediaType) => {
  return mediaType === MediaType.ANIME
    ? ANILIST_ANIME_FORMATS
    : ANILIST_MANGA_FORMATS;
};

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
  const [selectedStatus, setSelectedStatus] = useState<
    AnilistAiringStatus | AnilistPublishingStatus | ''
  >(
    () =>
      (sessionStorage.getItem(`${storageKey}_status`) as
        | AnilistAiringStatus
        | AnilistPublishingStatus) ?? '',
  );
  const [selectedGenres, setSelectedGenres] = useState<AnilistGenre[]>(() => {
    const stored = sessionStorage.getItem(`${storageKey}_genres`);
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedCountry, setSelectedCountry] = useState<string>(
    () => sessionStorage.getItem(`${storageKey}_country`) ?? '',
  );
  const [isAdult, setIsAdult] = useState<boolean>(() => {
    return sessionStorage.getItem(`${storageKey}_adult`) === 'true';
  });
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [genreSearch, setGenreSearch] = useState('');
  const [genreDropdownIndex, setGenreDropdownIndex] = useState<number>(-1); // for keyboard nav
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [yearSearch, setYearSearch] = useState('');
  const [yearDropdownIndex, setYearDropdownIndex] = useState<number>(-1); // for keyboard nav

  const genreSearchRef = useRef<HTMLInputElement>(null);
  const yearSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showGenreDropdown)
      setTimeout(() => genreSearchRef.current?.focus(), 50);
    else setGenreSearch('');
  }, [showGenreDropdown]);

  useEffect(() => {
    if (showYearDropdown) setTimeout(() => yearSearchRef.current?.focus(), 50);
    else {
      setYearSearch('');
      setYearDropdownIndex(-1); // reset index when closed
    }
  }, [showYearDropdown]);

  useEffect(() => {
    if (location.state?.reset) {
      setSearchQuery('');
      setDebouncedSearchQuery('');
      setSortBy(ANILIST_SORT_OPTIONS.TRENDING_DESC);
      setSelectedSeason('');
      setSelectedYear('');
      setSelectedStatus('');
      setSelectedGenres([]);
      setSelectedCountry('');
      setIsAdult(false);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_query`, searchQuery);
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, storageKey]);

  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_sort`, sortBy);
  }, [sortBy, storageKey]);
  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_season`, selectedSeason);
  }, [selectedSeason, storageKey]);
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
    sessionStorage.setItem(
      `${storageKey}_genres`,
      JSON.stringify(selectedGenres),
    );
  }, [selectedGenres, storageKey]);
  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_country`, selectedCountry);
  }, [selectedCountry, storageKey]);
  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_adult`, String(isAdult));
  }, [isAdult, storageKey]);
  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_format`, selectedFormat);
  }, [selectedFormat, storageKey]);

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
    ...(selectedCountry && { countryOfOrigin: selectedCountry }),
    isAdult: isAdult, // ALWAYS pass isAdult, not conditionally
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

  const toggleGenre = (genre: AnilistGenre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  const hasActiveFilters =
    selectedSeason !== '' ||
    selectedYear !== '' ||
    selectedStatus !== '' ||
    selectedGenres.length > 0 ||
    selectedCountry !== '' ||
    isAdult ||
    selectedFormat !== ''; // ADD selectedFormat

  const clearFilters = () => {
    setSelectedSeason('');
    setSelectedYear('');
    setSelectedStatus('');
    setSelectedGenres([]);
    setSelectedCountry('');
    setIsAdult(false);
    setSelectedFormat(''); // ADD THIS
  };

  const statusOptions = isAnime
    ? ANILIST_AIRING_STATUS
    : ANILIST_PUBLISHING_STATUS;

  const filteredGenres = ANILIST_GENRES.filter((g) =>
    fuzzyMatch(genreSearch, g),
  );
  const filteredYears = YEAR_OPTIONS.filter((y) =>
    fuzzyMatch(yearSearch, String(y)),
  );

  const selectBase =
    'relative appearance-none pl-4 pr-10 py-3 bg-zinc-800/80 backdrop-blur-xl border rounded-xl text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200';
  const activeSelect = 'border-blue-500 text-white';
  const inactiveSelect = 'border-zinc-700 text-zinc-400';

  // Active filter chips — add format chip
  const activeChips: { key: string; label: string; onRemove: () => void }[] = [
    ...selectedGenres.map((g) => ({
      key: `genre-${g}`,
      label: g,
      onRemove: () => toggleGenre(g),
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

  // --- DROPDOWN KEYBOARD HANDLERS ---
  const handleGenreDropdownKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement | HTMLInputElement>,
  ) => {
    if (!showGenreDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setGenreDropdownIndex((prev) =>
        Math.min(prev + 1, filteredGenres.length - 1),
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setGenreDropdownIndex((prev) => Math.max(prev - 1, 0));
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

  // ADD: Year dropdown keyboard handler
  const handleYearDropdownKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement | HTMLInputElement>,
  ) => {
    if (!showYearDropdown) return;
    // +1 offset for the "Any" option at index 0
    const totalItems = filteredYears.length + 1;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setYearDropdownIndex((prev) => Math.min(prev + 1, totalItems - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setYearDropdownIndex((prev) => Math.max(prev - 1, 0));
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
      {/* Hero Section with Search */}
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

          {/* Search Bar + Sort By */}
          <div className="max-w-3xl mx-auto flex items-center gap-3">
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
                                key={genre}
                                className={`flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-700 cursor-pointer transition-colors ${
                                  genreDropdownIndex === idx
                                    ? 'bg-blue-600/30'
                                    : ''
                                }`}
                                tabIndex={-1}
                                onMouseEnter={() => setGenreDropdownIndex(idx)}
                                onClick={() => toggleGenre(genre)}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedGenres.includes(genre)}
                                  readOnly
                                  className="accent-blue-500 w-4 h-4 cursor-pointer"
                                />
                                <span className="text-sm text-white">
                                  {genre}
                                </span>
                              </label>
                            ))
                          )}
                        </div>
                        {selectedGenres.length > 0 && (
                          <div className="p-2 border-t border-zinc-700">
                            <button
                              onClick={() => setSelectedGenres([])}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') setSelectedGenres([]);
                              }}
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

              {/* ── Media Format ── */}
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">
                  Format
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className={`${selectBase} ${selectedFormat ? activeSelect : inactiveSelect}`}
                  >
                    <option value="" className="bg-zinc-800 text-zinc-400">
                      Any
                    </option>
                    {getFormatOptions(mediaType).map((format) => (
                      <option
                        key={format}
                        value={format}
                        className="bg-zinc-800 text-white"
                      >
                        {format
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none text-xs">
                    ▼
                  </span>
                </div>
              </div>

              {/* ── Season (anime only) ── */}
              {isAnime && (
                <div className="flex flex-col gap-1 shrink-0">
                  <label className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">
                    Season
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                    <select
                      value={selectedSeason}
                      onChange={(e) =>
                        setSelectedSeason(e.target.value as AnilistSeason | '')
                      }
                      className={`${selectBase} ${selectedSeason ? activeSelect : inactiveSelect}`}
                    >
                      <option value="" className="bg-zinc-800 text-zinc-400">
                        Any
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
                </div>
              )}

              {/* ── Year (searchable) ── */}
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
                          {/* "Any" option at index 0 */}
                          <button
                            onClick={() => {
                              setSelectedYear('');
                              setShowYearDropdown(false);
                            }}
                            onMouseEnter={() => setYearDropdownIndex(0)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 transition-colors
                              ${yearDropdownIndex === 0 ? 'bg-blue-600/30' : ''}
                              ${!selectedYear ? 'text-blue-400' : 'text-zinc-400'}`}
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
                                } // +1 for "Any"
                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-700 transition-colors
                                  ${yearDropdownIndex === idx + 1 ? 'bg-blue-600/30' : ''}
                                  ${selectedYear === year ? 'text-blue-400 bg-zinc-700/50' : 'text-white'}`}
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

              {/* ── Status ── */}
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">
                  {isAnime ? 'Airing Status' : 'Publishing Status'}
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <select
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as typeof selectedStatus)
                    }
                    className={`${selectBase} ${selectedStatus ? activeSelect : inactiveSelect}`}
                  >
                    <option value="" className="bg-zinc-800 text-zinc-400">
                      Any
                    </option>
                    {statusOptions.map((status) => (
                      <option
                        key={status}
                        value={status}
                        className="bg-zinc-800 text-white"
                      >
                        {formatStatusDisplay(status)}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none text-xs">
                    ▼
                  </span>
                </div>
              </div>

              {/* ── Country ── */}
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">
                  Country
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className={`${selectBase} ${selectedCountry ? activeSelect : inactiveSelect}`}
                  >
                    <option value="" className="bg-zinc-800 text-zinc-400">
                      Any
                    </option>
                    {ANILIST_COUNTRIES.map((country) => (
                      <option
                        key={country.code}
                        value={country.code}
                        className="bg-zinc-800 text-white"
                      >
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none text-xs">
                    ▼
                  </span>
                </div>
              </div>

              {/* ── Adult Toggle ── */}
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">
                  Adult
                </label>
                <button
                  onClick={() => setIsAdult((prev) => !prev)}
                  className={`px-4 py-3 text-sm border rounded-xl transition-all duration-200 bg-zinc-800/80 backdrop-blur-xl
                    ${isAdult ? 'border-blue-500 text-white' : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'}`}
                >
                  18+ {isAdult ? '✓' : ''}
                </button>
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

      {/* Content Section */}
      <div className="relative z-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
