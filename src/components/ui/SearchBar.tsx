import { XMarkIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch?: () => void;
  mediaType: string;
  accentColor?: 'blue' | 'purple';
}

const SearchBar = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  mediaType,
  accentColor = 'blue',
}: SearchBarProps) => {
  // Gradient colors
  const glowGradient =
    accentColor === 'purple'
      ? 'from-purple-500 to-pink-600'
      : 'from-blue-500 to-purple-600';

  const borderGradient =
    accentColor === 'purple'
      ? 'from-purple-400 to-pink-600'
      : 'from-blue-400 to-purple-600';

  const handleClear = () => {
    if (onClearSearch) {
      onClearSearch();
    } else {
      onSearchChange('');
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5">
      <div className="max-w-3xl mx-auto">
        <div className="relative group">
          <div
            className={`absolute inset-0 bg-linear-to-r ${glowGradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`}
          />
          <div className="relative flex items-center">
            {/* Gradient Border */}
            <div
              className={`absolute inset-0 rounded-2xl bg-linear-to-r ${borderGradient} p-0.5 pointer-events-none`}
            >
              <div className="w-full h-full bg-zinc-800/80 rounded-2xl" />
            </div>

            <input
              type="text"
              placeholder={`Search for ${mediaType.charAt(0).toUpperCase() + mediaType.slice(1).toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`relative w-full pl-14 pr-10 py-5 bg-transparent text-white placeholder-zinc-500 focus:outline-none   transition-all duration-200 text-lg`}
            />
            {searchQuery && (
              <button
                onClick={handleClear}
                className="absolute right-4 cursor-pointer text-zinc-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
