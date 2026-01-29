interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder: string;
  mediaType: string;
}

const SearchBar = ({
  searchQuery,
  onSearchChange,
  placeholder,
  mediaType,
}: SearchBarProps) => {
  return (
    <div className="relative overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-blue-600/10 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Page Title */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Discover{' '}
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
              <span className="absolute left-5 text-zinc-400 text-xl">🔍</span>
              <input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-14 pr-4 py-5 bg-zinc-800/80 backdrop-blur-xl border border-zinc-700 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-4 text-zinc-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
