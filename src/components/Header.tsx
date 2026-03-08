import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaChevronDown } from 'react-icons/fa';
import {
  getCurrentSeason,
  getNextSeason,
  ANILIST_SORT_OPTIONS,
  ANILIST_AIRING_STATUS,
} from '../constants/anilistFilters';
import { TMDB_MOVIE_SORT_OPTIONS } from '../constants/tmdbFilters';

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getTmdbMovieDateRanges = () => {
  const today = new Date();

  const playingFrom = new Date(today);
  playingFrom.setDate(today.getDate() - 35);
  const playingTo = new Date(today);
  playingTo.setDate(today.getDate() + 7);

  const upcomingFrom = new Date(today);
  upcomingFrom.setDate(today.getDate() + 7);
  const upcomingTo = new Date(today);
  upcomingTo.setDate(today.getDate() + 37);

  return {
    playingNow: { from: formatDate(playingFrom), to: formatDate(playingTo) },
    upcoming: { from: formatDate(upcomingFrom), to: formatDate(upcomingTo) },
  };
};

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const filterNavCounter = useRef(0);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const { season: currentSeason, year: currentYear } = getCurrentSeason();
  const { season: nextSeason, year: nextYear } = getNextSeason(
    currentSeason,
    currentYear,
  );
  const movieDates = getTmdbMovieDateRanges();

  // Only anime, manga, movie have dropdown items — tv title still navigates to search
  const mediaTypes = [
    { name: 'Anime', path: 'anime' },
    { name: 'Manga', path: 'manga' },
    { name: 'Movies', path: 'movie' },
    { name: 'TV Shows', path: 'tv' },
  ];

  const navLinks = [{ path: '/library', label: 'Library' }];

  const isActive = (path: string) => location.pathname === path;

  const handleMouseEnter = (mediaPath: string) => {
    // Only open dropdown for paths that have items
    if (['anime', 'manga', 'movie'].includes(mediaPath)) {
      setActiveDropdown(mediaPath);
    }
  };
  const handleMouseLeave = () => setActiveDropdown(null);

  const clearSearchStorage = (mediaPath: string) => {
    const anilistKey = `searchAnilist_${mediaPath}`;
    [
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
    ].forEach((key) => sessionStorage.removeItem(`${anilistKey}_${key}`));
    const tmdbKey = `searchTmdb_${mediaPath}`;
    [
      'query',
      'sort',
      'genres',
      'year',
      'status',
      'language',
      'minRating',
      'runtimeMin',
      'runtimeMax',
      'runtimeEnabled',
      'dateFrom',
      'dateTo',
    ].forEach((key) => sessionStorage.removeItem(`${tmdbKey}_${key}`));
  };

  const handleTitleNavigate = (mediaPath: string) => {
    clearSearchStorage(mediaPath);
    setActiveDropdown(null);
    window.scrollTo(0, 0);
    navigate(`/${mediaPath}/search`, { state: { reset: true } });
  };

  const handleMobileTitleNavigate = (mediaPath: string) => {
    clearSearchStorage(mediaPath);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
    navigate(`/${mediaPath}/search`, { state: { reset: true } });
  };

  const navigateWithFilters = (
    mediaPath: string,
    filters: Record<string, string>,
    storagePrefix: 'searchAnilist' | 'searchTmdb' = 'searchAnilist',
    isMobile = false,
  ) => {
    clearSearchStorage(mediaPath);
    const storageKey = `${storagePrefix}_${mediaPath}`;
    Object.entries(filters).forEach(([key, value]) => {
      sessionStorage.setItem(`${storageKey}_${key}`, value);
    });
    if (isMobile) setIsMobileMenuOpen(false);
    else setActiveDropdown(null);
    window.scrollTo(0, 0);
    filterNavCounter.current += 1;
    navigate(`/${mediaPath}/search`, {
      state: { filtersApplied: filterNavCounter.current },
    });
  };

  const airingNowStatus = ANILIST_AIRING_STATUS[0]; // 'RELEASING'
  const notYetReleasedStatus = ANILIST_AIRING_STATUS[2]; // 'NOT_YET_RELEASED'

  const dropdownItemClass =
    'w-full text-left px-3 py-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors';
  const dropdownLabelClass =
    'text-sm font-medium text-zinc-300 hover:text-white';
  const dropdownSubClass = 'text-xs text-zinc-500';
  const mobileItemClass =
    'w-full text-left px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/30 rounded-lg transition-colors';

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-zinc-800/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-3 group">
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight">
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-600">
                  My
                </span>
                <span className="text-white">Chronicle</span>
              </span>
              <span className="text-[10px] font-medium text-zinc-500 tracking-widest uppercase -mt-1">
                Your Media Hub
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {mediaTypes.map((media) => (
              <div
                key={media.path}
                className="relative group"
                onMouseEnter={() => handleMouseEnter(media.path)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => handleTitleNavigate(media.path)}
                  className="flex items-center gap-2 px-4 py-2.5 font-semibold text-sm tracking-wide text-zinc-400 hover:text-white transition-all duration-300"
                >
                  {media.name}
                  {/* Only show chevron for paths with dropdown items */}
                  {['anime', 'manga', 'movie'].includes(media.path) && (
                    <FaChevronDown
                      size={10}
                      className={`transition-transform duration-300 ${activeDropdown === media.path ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>

                {/* Only render dropdown for paths that have items */}
                {['anime', 'manga', 'movie'].includes(media.path) && (
                  <div
                    className={`absolute top-full left-0 mt-2 w-52 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl transition-all duration-300 ${
                      activeDropdown === media.path
                        ? 'opacity-100 visible translate-y-0'
                        : 'opacity-0 invisible translate-y-2'
                    }`}
                  >
                    <div className="p-2">
                      {/* Anime */}
                      {media.path === 'anime' && (
                        <>
                          <button
                            onClick={() =>
                              navigateWithFilters('anime', {
                                sort: ANILIST_SORT_OPTIONS.TRENDING_DESC,
                              })
                            }
                            className={dropdownItemClass}
                          >
                            <span className={dropdownLabelClass}>Trending</span>
                          </button>

                          <button
                            onClick={() =>
                              navigateWithFilters('anime', {
                                sort: ANILIST_SORT_OPTIONS.POPULARITY_DESC,
                                season: currentSeason,
                                year: String(currentYear),
                                status: airingNowStatus,
                              })
                            }
                            className={dropdownItemClass}
                          >
                            <span className={dropdownLabelClass}>
                              Airing Now
                            </span>
                            <p className={dropdownSubClass}>
                              {currentSeason.charAt(0) +
                                currentSeason.slice(1).toLowerCase()}{' '}
                              {currentYear}
                            </p>
                          </button>

                          <button
                            onClick={() =>
                              navigateWithFilters('anime', {
                                sort: ANILIST_SORT_OPTIONS.POPULARITY_DESC,
                                season: nextSeason,
                                year: String(nextYear),
                                status: notYetReleasedStatus,
                              })
                            }
                            className={dropdownItemClass}
                          >
                            <span className={dropdownLabelClass}>Upcoming</span>
                            <p className={dropdownSubClass}>
                              {nextSeason.charAt(0) +
                                nextSeason.slice(1).toLowerCase()}{' '}
                              {nextYear}
                            </p>
                          </button>
                        </>
                      )}

                      {/* Manga */}
                      {media.path === 'manga' && (
                        <>
                          <button
                            onClick={() =>
                              navigateWithFilters('manga', {
                                sort: ANILIST_SORT_OPTIONS.TRENDING_DESC,
                              })
                            }
                            className={dropdownItemClass}
                          >
                            <span className={dropdownLabelClass}>Trending</span>
                          </button>

                          <button
                            onClick={() =>
                              navigateWithFilters('manga', {
                                sort: ANILIST_SORT_OPTIONS.POPULARITY_DESC,
                                country: 'KR',
                              })
                            }
                            className={dropdownItemClass}
                          >
                            <span className={dropdownLabelClass}>
                              Popular Manhwa
                            </span>
                            <p className={dropdownSubClass}>
                              Top from South Korea
                            </p>
                          </button>
                        </>
                      )}

                      {/* Movies */}
                      {media.path === 'movie' && (
                        <>
                          <button
                            onClick={() =>
                              navigateWithFilters(
                                'movie',
                                {
                                  sort: TMDB_MOVIE_SORT_OPTIONS.POPULARITY_DESC,
                                  dateFrom: movieDates.playingNow.from,
                                  dateTo: movieDates.playingNow.to,
                                },
                                'searchTmdb',
                              )
                            }
                            className={dropdownItemClass}
                          >
                            <span className={dropdownLabelClass}>
                              Playing Now
                            </span>
                          </button>

                          <button
                            onClick={() =>
                              navigateWithFilters(
                                'movie',
                                {
                                  sort: TMDB_MOVIE_SORT_OPTIONS.POPULARITY_DESC,
                                  dateFrom: movieDates.upcoming.from,
                                  dateTo: movieDates.upcoming.to,
                                },
                                'searchTmdb',
                              )
                            }
                            className={dropdownItemClass}
                          >
                            <span className={dropdownLabelClass}>Upcoming</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Regular Nav Links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm tracking-wide transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2.5 bg-zinc-900/80 hover:bg-zinc-800/80 rounded-xl transition-all duration-300 border border-zinc-800 hover:border-zinc-700"
                >
                  <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">
                      {user?.username}
                    </p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`}
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
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-zinc-800">
                        <p className="text-sm font-semibold text-white">
                          {user?.username}
                        </p>
                      </div>
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 hover:text-white transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <span>Profile Settings</span>
                        </Link>
                      </div>
                      <div className="border-t border-zinc-800 pt-2">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full text-left"
                        >
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="relative px-8 py-3 font-semibold text-sm text-white rounded-xl overflow-hidden group"
              >
                <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-800/50">
            <div className="space-y-4">
              {mediaTypes.map((media) => (
                <div key={media.path} className="px-4">
                  <button
                    onClick={() => handleMobileTitleNavigate(media.path)}
                    className="w-full text-left mb-2 text-white font-semibold text-sm hover:text-blue-400 transition-colors"
                  >
                    {media.name}
                  </button>

                  {/* Only render sub-items for paths that have them */}
                  {['anime', 'manga', 'movie'].includes(media.path) && (
                    <div className="space-y-1 pl-2 border-l border-zinc-800">
                      {media.path === 'anime' && (
                        <>
                          <button
                            onClick={() =>
                              navigateWithFilters(
                                'anime',
                                { sort: ANILIST_SORT_OPTIONS.POPULARITY_DESC },
                                'searchAnilist',
                                true,
                              )
                            }
                            className={mobileItemClass}
                          >
                            Trending
                          </button>
                          <button
                            onClick={() =>
                              navigateWithFilters(
                                'anime',
                                {
                                  sort: ANILIST_SORT_OPTIONS.POPULARITY_DESC,
                                  season: currentSeason,
                                  year: String(currentYear),
                                  status: airingNowStatus,
                                },
                                'searchAnilist',
                                true,
                              )
                            }
                            className={mobileItemClass}
                          >
                            Airing Now
                          </button>
                          <button
                            onClick={() =>
                              navigateWithFilters(
                                'anime',
                                {
                                  sort: ANILIST_SORT_OPTIONS.POPULARITY_DESC,
                                  season: nextSeason,
                                  year: String(nextYear),
                                  status: notYetReleasedStatus,
                                },
                                'searchAnilist',
                                true,
                              )
                            }
                            className={mobileItemClass}
                          >
                            Upcoming
                          </button>
                        </>
                      )}

                      {media.path === 'manga' && (
                        <>
                          <button
                            onClick={() =>
                              navigateWithFilters(
                                'manga',
                                { sort: ANILIST_SORT_OPTIONS.POPULARITY_DESC },
                                'searchAnilist',
                                true,
                              )
                            }
                            className={mobileItemClass}
                          >
                            Trending
                          </button>
                          <button
                            onClick={() =>
                              navigateWithFilters(
                                'manga',
                                {
                                  sort: ANILIST_SORT_OPTIONS.POPULARITY_DESC,
                                  country: 'KR',
                                },
                                'searchAnilist',
                                true,
                              )
                            }
                            className={mobileItemClass}
                          >
                            Popular Manhwa
                          </button>
                        </>
                      )}

                      {media.path === 'movie' && (
                        <>
                          <button
                            onClick={() =>
                              navigateWithFilters(
                                'movie',
                                {
                                  sort: TMDB_MOVIE_SORT_OPTIONS.POPULARITY_DESC,
                                  dateFrom: movieDates.playingNow.from,
                                  dateTo: movieDates.playingNow.to,
                                },
                                'searchTmdb',
                                true,
                              )
                            }
                            className={mobileItemClass}
                          >
                            Playing Now
                          </button>
                          <button
                            onClick={() =>
                              navigateWithFilters(
                                'movie',
                                {
                                  sort: TMDB_MOVIE_SORT_OPTIONS.RELEASE_DATE_ASC,
                                  dateFrom: movieDates.upcoming.from,
                                  dateTo: movieDates.upcoming.to,
                                },
                                'searchTmdb',
                                true,
                              )
                            }
                            className={mobileItemClass}
                          >
                            Upcoming
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-linear-to-r from-blue-500/10 to-purple-500/10 text-white border-l-4 border-blue-500'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-zinc-800/50 mt-4 pt-4">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 mb-2 bg-zinc-900/50 rounded-lg">
                    <p className="text-sm font-semibold text-white">
                      {user?.username}
                    </p>
                    <p className="text-xs font-medium text-zinc-500 capitalize mt-0.5">
                      {user?.role}
                    </p>
                  </div>
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 hover:text-white rounded-lg transition-colors"
                  >
                    <span>Home</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 hover:text-white rounded-lg transition-colors"
                  >
                    <span>Profile Settings</span>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 hover:text-white rounded-lg transition-colors"
                    >
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors w-full text-left mt-2"
                  >
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg text-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
