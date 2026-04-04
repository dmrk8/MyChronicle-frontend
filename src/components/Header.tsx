import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaChevronDown } from 'react-icons/fa';
import {
  getCurrentSeason,
  getNextSeason,
  ANILIST_SORT_OPTIONS,
  ANILIST_AIRING_STATUS,
} from '../constants/anilistFilters';
import { TMDB_MOVIE_SORT_OPTIONS } from '../constants/tmdbFilters';
import { NavigationLink } from './NavigationLink';

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

  const mediaTypes = [
    { name: 'Anime', path: 'anime' },
    { name: 'Manga', path: 'manga' },
    { name: 'Movies', path: 'movie' },
    { name: 'TV Shows', path: 'tv' },
  ];

  const navLinks = [{ path: '/library', label: 'Library' }];
  const isActive = (path: string) => location.pathname === path;

  const handleMouseEnter = (mediaPath: string) => {
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
      'genres_excluded',
      'tags',
      'tags_excluded',
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
    isMobile = false,
  ) => {
    clearSearchStorage(mediaPath);
    if (isMobile) setIsMobileMenuOpen(false);
    else setActiveDropdown(null);
    window.scrollTo(0, 0);
    filterNavCounter.current += 1;
    navigate(`/${mediaPath}/search`, {
      state: {
        filtersApplied: filterNavCounter.current,
        filters,
      },
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
    'block w-full text-left px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/30 rounded-lg transition-colors';

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-zinc-800/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <NavigationLink
            href="/home"
            onClick={() => navigate('/home')}
            className="flex items-center gap-3 group cursor-pointer"
          >
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
          </NavigationLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {mediaTypes.map((media) => (
              <div
                key={media.path}
                className="relative group"
                onMouseEnter={() => handleMouseEnter(media.path)}
                onMouseLeave={handleMouseLeave}
              >
                <NavigationLink
                  href={`/${media.path}/search`}
                  onClick={() => handleTitleNavigate(media.path)}
                  className="flex items-center gap-2 px-4 py-2.5 font-semibold text-sm tracking-wide text-zinc-400 hover:text-white transition-all duration-300 cursor-pointer"
                >
                  {media.name}
                  {['anime', 'manga', 'movie'].includes(media.path) && (
                    <FaChevronDown
                      size={10}
                      className={`transition-transform duration-300 ${
                        activeDropdown === media.path ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </NavigationLink>

                {/* Dropdown */}
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
                          <NavigationLink
                            href="/anime/search"
                            onClick={() =>
                              navigateWithFilters('anime', {
                                sort: ANILIST_SORT_OPTIONS.TRENDING_DESC,
                              })
                            }
                            className={`${dropdownItemClass} block cursor-pointer`}
                          >
                            <span className={dropdownLabelClass}>Trending</span>
                          </NavigationLink>

                          <NavigationLink
                            href="/anime/search"
                            onClick={() =>
                              navigateWithFilters('anime', {
                                sort: ANILIST_SORT_OPTIONS.POPULARITY_DESC,
                                season: currentSeason,
                                year: String(currentYear),
                                status: airingNowStatus,
                              })
                            }
                            className={`${dropdownItemClass} block cursor-pointer`}
                          >
                            <span className={dropdownLabelClass}>
                              Airing Now
                            </span>
                            <p className={dropdownSubClass}>
                              {currentSeason.charAt(0) +
                                currentSeason.slice(1).toLowerCase()}{' '}
                              {currentYear}
                            </p>
                          </NavigationLink>

                          <NavigationLink
                            href="/anime/search"
                            onClick={() =>
                              navigateWithFilters('anime', {
                                sort: ANILIST_SORT_OPTIONS.POPULARITY_DESC,
                                season: nextSeason,
                                year: String(nextYear),
                                status: notYetReleasedStatus,
                              })
                            }
                            className={`${dropdownItemClass} block cursor-pointer`}
                          >
                            <span className={dropdownLabelClass}>Upcoming</span>
                            <p className={dropdownSubClass}>
                              {nextSeason.charAt(0) +
                                nextSeason.slice(1).toLowerCase()}{' '}
                              {nextYear}
                            </p>
                          </NavigationLink>
                        </>
                      )}

                      {/* Manga */}
                      {media.path === 'manga' && (
                        <>
                          <NavigationLink
                            href="/manga/search"
                            onClick={() =>
                              navigateWithFilters('manga', {
                                sort: ANILIST_SORT_OPTIONS.TRENDING_DESC,
                              })
                            }
                            className={`${dropdownItemClass} block cursor-pointer`}
                          >
                            <span className={dropdownLabelClass}>Trending</span>
                          </NavigationLink>

                          <NavigationLink
                            href="/manga/search"
                            onClick={() =>
                              navigateWithFilters('manga', {
                                sort: ANILIST_SORT_OPTIONS.POPULARITY_DESC,
                                country: 'KR',
                              })
                            }
                            className={`${dropdownItemClass} block cursor-pointer`}
                          >
                            <span className={dropdownLabelClass}>
                              Popular Manhwa
                            </span>
                            <p className={dropdownSubClass}>
                              Top from South Korea
                            </p>
                          </NavigationLink>
                        </>
                      )}

                      {/* Movies */}
                      {media.path === 'movie' && (
                        <>
                          <NavigationLink
                            href="/movie/search"
                            onClick={() =>
                              navigateWithFilters('movie', {
                                sort: TMDB_MOVIE_SORT_OPTIONS.POPULARITY_DESC,
                                dateFrom: movieDates.playingNow.from,
                                dateTo: movieDates.playingNow.to,
                              })
                            }
                            className={`${dropdownItemClass} block cursor-pointer`}
                          >
                            <span className={dropdownLabelClass}>
                              Playing Now
                            </span>
                          </NavigationLink>

                          <NavigationLink
                            href="/movie/search"
                            onClick={() =>
                              navigateWithFilters('movie', {
                                sort: TMDB_MOVIE_SORT_OPTIONS.POPULARITY_DESC,
                                dateFrom: movieDates.upcoming.from,
                                dateTo: movieDates.upcoming.to,
                              })
                            }
                            className={`${dropdownItemClass} block cursor-pointer`}
                          >
                            <span className={dropdownLabelClass}>Upcoming</span>
                          </NavigationLink>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Regular Nav Links */}
            {navLinks.map((link) => (
              <NavigationLink
                key={link.path}
                href={link.path}
                onClick={() => navigate(link.path)}
                className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm tracking-wide transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
                label={link.label}
              />
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
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">
                      {user?.username}
                    </p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
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
                        <NavigationLink
                          href="/profile"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate('/profile');
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 hover:text-white transition-colors cursor-pointer"
                          label="Profile Settings"
                        />
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
              <NavigationLink
                href="/login"
                onClick={() => navigate('/login')}
                className="relative px-8 py-3 font-semibold text-sm text-white rounded-xl overflow-hidden group cursor-pointer"
              >
                <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">Sign In</span>
              </NavigationLink>
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
                  <NavigationLink
                    href={`/${media.path}/search`}
                    onClick={() => handleMobileTitleNavigate(media.path)}
                    className="w-full text-left mb-2 text-zinc-400 font-semibold text-sm hover:text-white transition-colors cursor-pointer"
                    label={media.name}
                  />

                  {['anime', 'manga', 'movie'].includes(media.path) && (
                    <div className="space-y-1 pl-2 border-l border-zinc-800">
                      {media.path === 'anime' && (
                        <>
                          <NavigationLink
                            href="/anime/search"
                            onClick={() =>
                              navigateWithFilters('anime', {
                                sort: ANILIST_SORT_OPTIONS.TRENDING_DESC,
                              })
                            }
                            className={mobileItemClass}
                            label="Trending"
                          />
                          <NavigationLink
                            href="/anime/search"
                            onClick={() =>
                              navigateWithFilters('anime', {
                                sort: ANILIST_SORT_OPTIONS.POPULARITY_DESC,
                                season: currentSeason,
                                year: String(currentYear),
                                status: airingNowStatus,
                              })
                            }
                            className={mobileItemClass}
                            label="Airing Now"
                          />
                          <NavigationLink
                            href="/anime/search"
                            onClick={() =>
                              navigateWithFilters('anime', {
                                sort: ANILIST_SORT_OPTIONS.POPULARITY_DESC,
                                season: nextSeason,
                                year: String(nextYear),
                                status: notYetReleasedStatus,
                              })
                            }
                            className={mobileItemClass}
                            label="Upcoming"
                          />
                        </>
                      )}

                      {media.path === 'manga' && (
                        <>
                          <NavigationLink
                            href="/manga/search"
                            onClick={() =>
                              navigateWithFilters('manga', {
                                sort: ANILIST_SORT_OPTIONS.TRENDING_DESC,
                              })
                            }
                            className={mobileItemClass}
                            label="Trending"
                          />
                          <NavigationLink
                            href="/manga/search"
                            onClick={() =>
                              navigateWithFilters('manga', {
                                sort: ANILIST_SORT_OPTIONS.POPULARITY_DESC,
                                country: 'KR',
                              })
                            }
                            className={mobileItemClass}
                            label="Popular Manhwa"
                          />
                        </>
                      )}

                      {media.path === 'movie' && (
                        <>
                          <NavigationLink
                            href="/movie/search"
                            onClick={() =>
                              navigateWithFilters('movie', {
                                sort: TMDB_MOVIE_SORT_OPTIONS.POPULARITY_DESC,
                                dateFrom: movieDates.playingNow.from,
                                dateTo: movieDates.playingNow.to,
                              })
                            }
                            className={mobileItemClass}
                            label="Playing Now"
                          />
                          <NavigationLink
                            href="/movie/search"
                            onClick={() =>
                              navigateWithFilters('movie', {
                                sort: TMDB_MOVIE_SORT_OPTIONS.POPULARITY_DESC,
                                dateFrom: movieDates.upcoming.from,
                                dateTo: movieDates.upcoming.to,
                              })
                            }
                            className={mobileItemClass}
                            label="Upcoming"
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {navLinks.map((link) => (
                <NavigationLink
                  key={link.path}
                  href={link.path}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate(link.path);
                  }}
                  className={`block px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-linear-to-r from-blue-500/10 to-purple-500/10 text-white border-l-4 border-blue-500'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                  label={link.label}
                />
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
                  <NavigationLink
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 hover:text-white rounded-lg transition-colors cursor-pointer"
                    label="Home"
                  />
                  <NavigationLink
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 hover:text-white rounded-lg transition-colors cursor-pointer"
                    label="Profile Settings"
                  />
                  {user?.role === 'admin' && (
                    <NavigationLink
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 hover:text-white rounded-lg transition-colors cursor-pointer"
                      label="Admin Panel"
                    />
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
                <NavigationLink
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg text-center cursor-pointer"
                  label="Sign In"
                />
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
