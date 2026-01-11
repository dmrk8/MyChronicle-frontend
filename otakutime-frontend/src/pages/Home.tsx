import { useNavigate } from 'react-router-dom';
import { useFeaturedMedia } from '../hooks/useMedia';
import { useState, useMemo } from 'react';
import { MediaType } from '../constants/mediaConstants';
import { SlidingMediaRow } from '../components/SlidingMediaRow';

const HomePage = () => {
  const navigate = useNavigate();

  // Fetch featured content for all media types
  const { data: animeData, isLoading: animeLoading } = useFeaturedMedia(
    MediaType.ANIME
  );
  const { data: movieData, isLoading: movieLoading } = useFeaturedMedia(
    MediaType.MOVIE
  );
  const { data: tvData, isLoading: tvLoading } = useFeaturedMedia(MediaType.TV);

  const isLoading = animeLoading || movieLoading || tvLoading;

  // Randomly choose between anime, movie, and TV data for hero, then pick a random item
  const [heroData] = useState(() => {
    const types = ['anime', 'movie', 'tv'] as const;
    return types[Math.floor(Math.random() * 3)];
  });
  const [randomIndex] = useState(() => Math.floor(Math.random() * 5));

  const heroContent =
    heroData === 'anime'
      ? animeData?.trending?.[randomIndex]
      : heroData === 'movie'
      ? movieData?.trending?.[randomIndex]
      : tvData?.trending?.[randomIndex];

  // Generate shuffle seed once on mount
  const [shuffleSeed] = useState(() => Math.random());

  // Memoized shuffled trending media with stable seed
  const allTrending = useMemo(() => {
    const combined = [
      ...(animeData?.trending || []),
      ...(movieData?.trending || []),
      ...(tvData?.trending || []),
    ];

    // Seeded pseudo-random shuffle
    const seededRandom = (seed: number, i: number) => {
      const x = Math.sin(seed + i) * 10000;
      return x - Math.floor(x);
    };

    const shuffled = [...combined];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(shuffleSeed, i) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }, [animeData, movieData, tvData, shuffleSeed]);

  const openDetails = (mediaType: MediaType, id: number) => {
    navigate(`/${mediaType}/${id}`);
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Hero Section - Netflix Style */}
      {heroContent && (
        <div className="relative h-screen w-full">
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0">
            <img
              src={heroContent.bannerImage || heroContent.coverImage}
              alt={heroContent.title}
              className="w-full h-full object-cover object-center"
              style={{ objectPosition: '50% 35%' }}
            />
            {/* Enhanced multi-layer gradients for better visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/95 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-3xl pt-20">
              {/* Title */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-2xl leading-tight">
                {heroContent.title}
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {heroContent.averageScore && (
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <span className="text-green-400 text-xl font-bold">
                      {heroContent.averageScore}/10
                    </span>
                  </div>
                )}
                {heroContent.releaseDate && (
                  <span className="text-white font-semibold text-lg bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg">
                    {heroContent.releaseDate.split('-')[0]}
                  </span>
                )}
                {heroContent.firstAirDate && (
                  <span className="text-white font-semibold text-lg bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg">
                    {heroContent.firstAirDate.split('-')[0]}
                  </span>
                )}
                {heroContent.episodes && (
                  <span className="text-zinc-200 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg">
                    {heroContent.episodes} Episodes
                  </span>
                )}
                {heroContent.status && (
                  <span className="px-3 py-2 bg-purple-600/80 backdrop-blur-sm text-white text-sm font-medium rounded-lg">
                    {heroContent.status}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    openDetails(
                      heroContent.mediaType as MediaType,
                      heroContent.id
                    )
                  }
                  className="flex items-center gap-3 px-10 py-5 bg-zinc-800/90 hover:bg-zinc-700/90 text-white font-bold text-lg rounded-lg transition-all backdrop-blur-sm shadow-xl"
                >
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  More Info
                </button>
              </div>

              {/* Genres */}
              {heroContent.genres && heroContent.genres.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 mt-8">
                  <span className="text-zinc-300 text-base font-medium">
                    Genres:
                  </span>
                  {heroContent.genres.slice(0, 4).map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-zinc-700"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced fade to black at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
        </div>
      )}

      {/* Content Rows */}
      <div className="relative pb-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 border-4 border-red-500/30 rounded-full" />
                <div className="absolute inset-0 border-4 border-red-500 rounded-full border-t-transparent animate-spin" />
              </div>
              <p className="text-zinc-400 text-lg">Loading content...</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Section Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Trending Now
                </h2>
                <p className="text-zinc-400 text-lg">
                  Discover the hottest anime, movies, and TV shows everyone's
                  watching
                </p>
              </div>

              {/* Combined Trending Content */}
              {allTrending.length > 0 && (
                <SlidingMediaRow
                  mediaList={allTrending}
                  onMediaClick={openDetails}
                />
              )}

              {/* Promotional Section - Netflix Style */}
              <div className="relative mt-20 mb-12 rounded-2xl overflow-hidden">
                {/* Background with gradient */}
                <div className="relative bg-gradient-to-br from-red-600 via-purple-600 to-blue-600 p-12 md:p-16">
                  <div className="absolute inset-0 bg-black/20" />

                  <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                      Discover, track, and rate movies, TV shows, and more — all in one place.
                    </h2>
                    <p className="text-xl md:text-2xl text-white/90 mb-8 font-medium">
                      All your medias. Rated, reviewed, remembered.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
