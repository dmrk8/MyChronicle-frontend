import { useState, useEffect, useRef, startTransition } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
} from '../../../constants/anilistFilters';
import type {
  AnilistMediaType,
  SearchAnilistParams,
} from '../../../api/anilistApi';

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

const genreButtonLabel = (
  included: AnilistGenre[],
  excluded: AnilistGenre[],
): string => {
  const total = included.length + excluded.length;
  if (total === 0) return 'Any';
  if (total === 1) return included[0] ?? `−${excluded[0]}`;
  return `${total} active`;
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

  const readStorage = () => ({
    query: sessionStorage.getItem(`${storageKey}_query`) ?? '',
    sort:
      (sessionStorage.getItem(`${storageKey}_sort`) as AnilistSortOptions) ??
      ANILIST_SORT_OPTIONS.POPULARITY_DESC,
    season:
      (sessionStorage.getItem(`${storageKey}_season`) as AnilistSeason) ?? '',
    year: (() => {
      const v = sessionStorage.getItem(`${storageKey}_year`);
      return v ? Number(v) : ('' as const);
    })(),
    status:
      (sessionStorage.getItem(`${storageKey}_status`) as
        | AnilistAiringStatus
        | AnilistPublishingStatus) ?? '',
    genres: (() => {
      const v = sessionStorage.getItem(`${storageKey}_genres`);
      return v ? (JSON.parse(v) as AnilistGenre[]) : [];
    })(),
    excludedGenres: (() => {
      const v = sessionStorage.getItem(`${storageKey}_genres_excluded`);
      return v ? (JSON.parse(v) as AnilistGenre[]) : [];
    })(),
    tags: (() => {
      const v = sessionStorage.getItem(`${storageKey}_tags`);
      return v ? (JSON.parse(v) as string[]) : [];
    })(),
    excludedTags: (() => {
      const v = sessionStorage.getItem(`${storageKey}_tags_excluded`);
      return v ? (JSON.parse(v) as string[]) : [];
    })(),
    country: sessionStorage.getItem(`${storageKey}_country`) ?? '',
    adult: sessionStorage.getItem(`${storageKey}_adult`) === 'true',
    format: sessionStorage.getItem(`${storageKey}_format`) ?? '',
  });

  const _init = (() => {
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
    if (!FILTER_KEYS.some((k) => searchParams.has(k))) return readStorage();
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

  const [searchQuery, setSearchQuery] = useState<string>(() => _init.query);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>(
    () => _init.query,
  );
  const [sortBy, setSortBy] = useState<AnilistSortOptions>(() => _init.sort);
  const [selectedSeason, setSelectedSeason] = useState<AnilistSeason | ''>(
    () => _init.season,
  );
  const [selectedYear, setSelectedYear] = useState<number | ''>(
    () => _init.year,
  );
  const [selectedStatus, setSelectedStatus] = useState<
    AnilistAiringStatus | AnilistPublishingStatus | ''
  >(() => _init.status);
  const [selectedGenres, setSelectedGenres] = useState<AnilistGenre[]>(
    () => _init.genres,
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(() => _init.tags);
  const [selectedCountry, setSelectedCountry] = useState<string>(
    () => _init.country,
  );
  const [isAdult, setIsAdult] = useState<boolean>(() => _init.adult);
  const [selectedFormat, setSelectedFormat] = useState<string>(
    () => _init.format,
  );
  const [excludedGenres, setExcludedGenres] = useState<AnilistGenre[]>(
    () => _init.excludedGenres,
  );
  const [excludedTags, setExcludedTags] = useState<string[]>(
    () => _init.excludedTags,
  );

  // ── Dropdown UI state ──────────────────────────────────────────────────────
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [genreSearch, setGenreSearch] = useState('');
  const [genreDropdownIndex, setGenreDropdownIndex] = useState<number>(-1);

  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [showAdultTags, setShowAdultTags] = useState(false);

  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [yearSearch, setYearSearch] = useState('');
  const [yearDropdownIndex, setYearDropdownIndex] = useState<number>(-1);

  const genreSearchRef = useRef<HTMLInputElement>(null);
  const yearSearchRef = useRef<HTMLInputElement>(null);
  const tagSearchRef = useRef<HTMLInputElement>(null);

  // ── Dropdown focus effects ─────────────────────────────────────────────────
  useEffect(() => {
    if (showGenreDropdown)
      setTimeout(() => genreSearchRef.current?.focus(), 50);
    else setTimeout(() => setGenreSearch(''), 0);
  }, [showGenreDropdown]);

  useEffect(() => {
    if (showYearDropdown) setTimeout(() => yearSearchRef.current?.focus(), 50);
    else {
      setTimeout(() => {
        setYearSearch('');
        setYearDropdownIndex(-1);
      }, 0);
    }
  }, [showYearDropdown]);

  useEffect(() => {
    if (showTagDropdown) setTimeout(() => tagSearchRef.current?.focus(), 50);
    else setTimeout(() => setTagSearch(''), 0);
  }, [showTagDropdown]);

  // ── Apply filters from Header navigation ──────────────────────────────────
  useEffect(() => {
    if (!location.state?.filtersApplied) return;

    const s = readStorage();
    startTransition(() => {
      setSearchQuery(s.query);
      setDebouncedSearchQuery(s.query);
      setSortBy(s.sort);
      setSelectedSeason(s.season);
      setSelectedYear(s.year);
      setSelectedStatus(s.status);
      setSelectedGenres(s.genres);
      setSelectedTags(s.tags);
      setSelectedCountry(s.country);
      setIsAdult(s.adult);
      setSelectedFormat(s.format);
      setExcludedGenres(s.excludedGenres);
      setExcludedTags(s.excludedTags);
    });
    window.history.replaceState({}, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.filtersApplied]);

  // ── Reset effect ───────────────────────────────────────────────────────────
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
    sessionStorage.setItem(`${storageKey}_tags`, JSON.stringify(selectedTags));
  }, [selectedTags, storageKey]);
  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_country`, selectedCountry);
  }, [selectedCountry, storageKey]);
  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_adult`, String(isAdult));
  }, [isAdult, storageKey]);
  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_format`, selectedFormat);
  }, [selectedFormat, storageKey]);
  useEffect(() => {
    sessionStorage.setItem(
      `${storageKey}_genres_excluded`,
      JSON.stringify(excludedGenres),
    );
  }, [excludedGenres, storageKey]);

  useEffect(() => {
    sessionStorage.setItem(
      `${storageKey}_tags_excluded`,
      JSON.stringify(excludedTags),
    );
  }, [excludedTags, storageKey]);

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
  const isInitialLoading = isFetching && mediaResults.length === 0;

  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    enabled: true,
  });

  const openDetails = (id: number) =>
    navigate(`/${mediaType.toLowerCase()}/${id}`);

  // ── Filter helpers ─────────────────────────────────────────────────────────

  const toggleGenre = (genre: AnilistGenre) => {
    if (selectedGenres.includes(genre)) {
      // selected → excluded
      setSelectedGenres((prev) => prev.filter((g) => g !== genre));
      setExcludedGenres((prev) => [...prev, genre]);
    } else if (excludedGenres.includes(genre)) {
      // excluded → none
      setExcludedGenres((prev) => prev.filter((g) => g !== genre));
    } else {
      // none → selected
      setSelectedGenres((prev) => [...prev, genre]);
    }
  };

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

  const hasActiveFilters =
    selectedSeason !== '' ||
    selectedYear !== '' ||
    selectedStatus !== '' ||
    selectedGenres.length > 0 ||
    excludedGenres.length > 0 ||
    selectedTags.length > 0 ||
    excludedTags.length > 0 ||
    selectedCountry !== '' ||
    isAdult ||
    selectedFormat !== '';

  const clearFilters = () => {
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
  const filteredGenres = ANILIST_GENRES.filter((g) =>
    fuzzyMatch(genreSearch, g),
  );
  const filteredYears = YEAR_OPTIONS.filter((y) =>
    fuzzyMatch(yearSearch, String(y)),
  );

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

  // ── Keyboard handlers ──────────────────────────────────────────────────────
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
    } else if (e.key === 'Escape') setShowGenreDropdown(false);
    else if (
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
    } else if (e.key === 'Escape') setShowYearDropdown(false);
    else if (e.key === 'Enter') {
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

  // ── Active chips ───────────────────────────────────────────────────────────
  const activeChips: {
    key: string;
    label: string;
    onRemove: () => void;
    isExcluded?: boolean;
  }[] = [
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
  const selectBase =
    'relative appearance-none pl-4 pr-10 py-3 bg-zinc-800/80 backdrop-blur-xl border rounded-xl text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200';
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
      <div className="relative overflow-visible">
        <div className="absolute inset-0 bg-linear-to-b from-blue-600/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 pt-20 pb-16">
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Search{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-600">
                {mediaType.charAt(0).toUpperCase() +
                  mediaType.slice(1).toLowerCase()}
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
                  placeholder={`Search for ${mediaType.toLowerCase()}...`}
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
                      setSortBy(e.target.value as AnilistSortOptions)
                    }
                    className={`${selectBase} ${inactiveSelect}`}
                  >
                    {(
                      Object.entries(ANILIST_SORT_OPTIONS) as [
                        string,
                        AnilistSortOptions,
                      ][]
                    ).map(([key, value]) => (
                      <option key={value} value={value} className="bg-zinc-800">
                        {sortLabel(key)}
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
                    className={`${selectBase} ${
                      selectedGenres.length > 0
                        ? activeSelect
                        : excludedGenres.length > 0
                          ? 'border-red-500 text-white'
                          : inactiveSelect
                    }`}
                    aria-haspopup="listbox"
                    aria-expanded={showGenreDropdown}
                  >
                    {genreButtonLabel(selectedGenres, excludedGenres)}
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
                            filteredGenres.map((genre, idx) => {
                              const state = selectedGenres.includes(genre)
                                ? 'include'
                                : excludedGenres.includes(genre)
                                  ? 'exclude'
                                  : 'none';
                              return (
                                <label
                                  key={genre}
                                  className={`flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-700 cursor-pointer transition-colors ${
                                    genreDropdownIndex === idx
                                      ? 'bg-blue-600/30'
                                      : ''
                                  }`}
                                  tabIndex={-1}
                                  onMouseEnter={() =>
                                    setGenreDropdownIndex(idx)
                                  }
                                  onClick={() => toggleGenre(genre)}
                                >
                                  <span
                                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                      state === 'include'
                                        ? 'bg-blue-500 border-blue-500'
                                        : state === 'exclude'
                                          ? 'bg-red-500 border-red-500'
                                          : 'border-zinc-600'
                                    }`}
                                  >
                                    {state === 'include' && (
                                      <svg
                                        className="w-2.5 h-2.5 text-white"
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
                                    {state === 'exclude' && (
                                      <span className="text-white text-xs font-bold leading-none">
                                        −
                                      </span>
                                    )}
                                  </span>
                                  <span
                                    className={`text-sm ${
                                      state === 'include'
                                        ? 'text-blue-200'
                                        : state === 'exclude'
                                          ? 'text-red-200'
                                          : 'text-white'
                                    }`}
                                  >
                                    {genre}
                                  </span>
                                </label>
                              );
                            })
                          )}
                        </div>
                        {(selectedGenres.length > 0 ||
                          excludedGenres.length > 0) && (
                          <div className="p-2 border-t border-zinc-700">
                            <button
                              onClick={() => {
                                setSelectedGenres([]);
                                setExcludedGenres([]);
                              }}
                              className="w-full text-xs text-zinc-400 hover:text-white transition-colors py-1"
                            >
                              Clear{' '}
                              {selectedGenres.length + excludedGenres.length}{' '}
                              active
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ── Tags ── */}
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">
                  Tags
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTagDropdown((prev) => !prev)}
                    className={`${selectBase} ${
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
                              onChange={(e) =>
                                setShowAdultTags(e.target.checked)
                              }
                              className="accent-blue-500 w-4 h-4"
                            />
                            <span className="text-xs text-zinc-400 whitespace-nowrap">
                              Show 18+ tags
                            </span>
                          </label>
                        </div>

                        {/* Selected tags chips */}
                        {(selectedTags.length > 0 ||
                          excludedTags.length > 0) && (
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
                          {filteredYears.map((year, idx) => (
                            <button
                              key={year}
                              onClick={() => {
                                setSelectedYear(year);
                                setShowYearDropdown(false);
                              }}
                              onMouseEnter={() => setYearDropdownIndex(idx + 1)}
                              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-700 transition-colors ${yearDropdownIndex === idx + 1 ? 'bg-blue-600/30' : ''} ${selectedYear === year ? 'text-blue-400 bg-zinc-700/50' : 'text-white'}`}
                            >
                              {year}
                            </button>
                          ))}
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

              {/* ── Adult ── */}
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
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg ${
                      chip.isExcluded
                        ? 'bg-red-500/15 border border-red-500/40 text-red-300'
                        : 'bg-blue-500/15 border border-blue-500/40 text-blue-300'
                    }`}
                  >
                    {chip.label}
                    <button
                      onClick={chip.onRemove}
                      className={`transition-colors leading-none ${
                        chip.isExcluded
                          ? 'text-red-400 hover:text-white'
                          : 'text-blue-400 hover:text-white'
                      }`}
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
      <div className="relative z-0 max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 py-10">
        {(mediaResults.length > 0 || isInitialLoading) && (
          <>
            <MediaGrid
              title=""
              mediaList={mediaResults}
              onMediaClick={openDetails}
              isLoading={isFetching}
            />
            {hasNextPage && (
              <div ref={sentinelRef}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 px-4 sm:px-8 lg:px-12 py-10">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="flex flex-col animate-pulse"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="w-full aspect-2/3 bg-zinc-800 rounded-lg mb-3" />
                      <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-zinc-800 rounded w-1/2" />
                    </div>
                  ))}
                </div>
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

export default SearchAnilist;
