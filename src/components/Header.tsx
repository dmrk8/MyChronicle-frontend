import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/anime/search', label: 'Anime' },
    { path: '/manga/search', label: 'Manga' },
    { path: '/movie/search', label: 'Movies' },
    { path: '/tv/search', label: 'TV Shows' },
    { path: '/library', label: 'Library' },
  ];

  const isActive = (path: string) => location.pathname === path;

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
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="relative group">
                <span
                  className={`relative px-6 py-2.5 font-semibold text-sm tracking-wide transition-all duration-300 ${
                    isActive(link.path)
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {link.label}

                  {/* Active indicator */}
                  {isActive(link.path) && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-blue-500 to-purple-600" />
                  )}

                  {/* Hover effect */}
                  {!isActive(link.path) && (
                    <span className="absolute bottom-0 left-1/2 right-1/2 h-0.5 bg-linear-to-r from-blue-500 to-purple-600 opacity-0 group-hover:left-0 group-hover:right-0 group-hover:opacity-100 transition-all duration-300" />
                  )}
                </span>
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

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    {/* Backdrop */}
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
            <div className="space-y-1">
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
