import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MediaType } from '../constants/mediaConstants';
import { SlidingMediaRow } from '../components/SlidingMediaRow';
import { useTrendingAnilist } from '../hooks/useAnilist';
import { useTmdbTrending } from '../hooks/useTmdb';
import { getCurrentSeason, ANILIST_SEASON_LABEL } from '../constants/anilistFilters';
import { NavigationLink } from '../components/NavigationLink';


// ── Skeleton Components (with loaded state colors) ────────────────────────
const HeroSkeleton = () => (
  <div className="relative min-h-screen w-full flex items-center bg-black">
    {/* Background blur effect */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="w-full h-full bg-linear-to-r from-black via-black/80 to-black/20" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-black to-transparent" />
    </div>

    {/* Content */}
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-20">
        {/* ── Left: Info Skeleton ── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Badge skeleton */}
          <div className="inline-block px-3 py-1 bg-white/10 border border-white/20 rounded-full">
            <div className="h-4 bg-white/5 rounded w-20 animate-pulse" />
          </div>

          {/* Title skeleton */}
          <div className="space-y-3">
            <div className="h-14 bg-white/5 rounded-lg w-4/5 animate-pulse" />
            <div className="h-14 bg-white/5 rounded-lg w-3/5 animate-pulse" />
          </div>

          {/* Meta badges skeleton */}
          <div className="flex flex-wrap gap-3">
            <div className="h-8 bg-black/40 border border-white/10 rounded-lg w-20 animate-pulse" />
            <div className="h-8 bg-black/40 border border-white/10 rounded-lg w-20 animate-pulse" />
            <div className="h-8 bg-black/40 border border-white/10 rounded-lg w-24 animate-pulse" />
            <div className="h-8 bg-purple-600/20 rounded-lg w-20 animate-pulse" />
          </div>

          {/* Genres skeleton */}
          <div className="flex flex-wrap gap-2">
            <div className="h-6 bg-white/5 border border-white/10 rounded-full w-20 animate-pulse" />
            <div className="h-6 bg-white/5 border border-white/10 rounded-full w-20 animate-pulse" />
            <div className="h-6 bg-white/5 border border-white/10 rounded-full w-20 animate-pulse" />
            <div className="h-6 bg-white/5 border border-white/10 rounded-full w-20 animate-pulse" />
          </div>

          {/* Button skeleton */}
          <div className="h-12 bg-white/80 rounded-xl w-36 animate-pulse" />
        </div>

        {/* ── Right: Cover Image Skeleton ── */}
        <div className="shrink-0 w-56 sm:w-64 md:w-72 lg:w-80">
          <div className="relative">
            <div className="absolute -inset-4 bg-linear-to-br from-purple-500/10 to-blue-500/10 rounded-3xl blur-2xl" />
            <div className="relative w-full aspect-2/3 rounded-2xl bg-white/5 border border-white/10 animate-pulse ring-1 ring-white/10" />
          </div>
        </div>
      </div>
    </div>

    <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black to-transparent pointer-events-none" />
  </div>
);

const TrendingRowSkeleton = () => (
  <section>
    <div className="mb-4 space-y-2">
      <div className="h-7 bg-white/5 rounded w-40 animate-pulse" />
      <div className="h-4 bg-white/5 rounded w-48 animate-pulse" />
    </div>
    {/* Simplified row skeleton - 6 items */}
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={`skeleton-${i}`} className="shrink-0 w-40">
          <div className="aspect-2/3 bg-white/5 border border-white/10 rounded-lg animate-pulse mb-3" />
          <div className="h-3 bg-white/5 rounded w-3/4 animate-pulse mb-2" />
          <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse" />
        </div>
      ))}
    </div>
  </section>
);

const HomePage = () => {
  const navigate = useNavigate();
  const { season, year } = getCurrentSeason();

  // ── Trending queries ───────────────────────────────────────────────────────
  const { data: trendingAnimeData, isLoading: animeLoading } =
    useTrendingAnilist('ANIME');
  const { data: trendingMangaData, isLoading: mangaLoading } =
    useTrendingAnilist('MANGA');
  const { data: trendingMovieData, isLoading: movieLoading } = useTmdbTrending(
    'movie',
    { timeWindow: 'week' },
  );
  const { data: trendingTvData, isLoading: tvLoading } = useTmdbTrending('tv', {
    timeWindow: 'week',
  });

  const isLoading = animeLoading || mangaLoading || movieLoading || tvLoading;

  // ── Flatten pages → flat lists ─────────────────────────────────────────────
  const trendingAnime =
    trendingAnimeData?.pages.flatMap((p) => p.results) ?? [];
  const trendingManga =
    trendingMangaData?.pages.flatMap((p) => p.results) ?? [];
  const trendingMovies =
    trendingMovieData?.pages.flatMap((p) => p.results) ?? [];
  const trendingTv = trendingTvData?.pages.flatMap((p) => p.results) ?? [];

  // ── Hero: pick from any of the four lists ─────────────────────────────────
  const [heroSource] = useState<'anime' | 'manga' | 'movie' | 'tv'>(
    () => (['anime', 'movie', 'tv'] as const)[Math.floor(Math.random() * 3)],
  );
  const [heroIndex] = useState(() => Math.floor(Math.random() * 6));

  const heroContent =
    heroSource === 'anime'
      ? trendingAnime[heroIndex]
      : heroSource === 'manga'
        ? trendingManga[heroIndex]
        : heroSource === 'movie'
          ? trendingMovies[heroIndex]
          : trendingTv[heroIndex];

  const openDetails = (mediaType: MediaType, id: number) => {
    navigate(`/${mediaType.toLowerCase()}/${id}`);
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* ── Hero ── */}
      {isLoading ? (
        <HeroSkeleton />
      ) : heroContent ? (
        <div className="relative min-h-screen w-full flex items-center">
          {/* Blurred background from cover image */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={heroContent.bannerImage || heroContent.coverImage || ''}
              alt=""
              className="w-full h-full object-cover object-center scale-110 blur-2xl brightness-30"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/60 to-black/20" />
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-black to-transparent" />
          </div>

          {/* Content */}
          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
            <div className="flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-20">
              {/* ── Left: Info ── */}
              <div className="flex-1 min-w-0">
                {/* Source badge */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 text-zinc-300 text-xs font-semibold uppercase tracking-widest rounded-full">
                    {heroContent.mediaType}
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-5 leading-tight drop-shadow-2xl">
                  {heroContent.title}
                </h1>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {heroContent.averageScore && (
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-white font-bold text-sm">
                        {heroContent.averageScore}
                      </span>
                    </div>
                  )}
                  {(heroContent.releaseDate || heroContent.firstAirDate) && (
                    <span className="text-white font-semibold text-sm bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                      {
                        (
                          heroContent.releaseDate ??
                          heroContent.firstAirDate ??
                          ''
                        ).split('-')[0]
                      }
                    </span>
                  )}
                  {heroContent.episodes && (
                    <span className="text-zinc-200 text-sm bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                      {heroContent.episodes} Episodes
                    </span>
                  )}
                  {heroContent.status && (
                    <span className="px-3 py-1.5 bg-purple-600/70 backdrop-blur-sm text-white text-sm font-medium rounded-lg">
                      {heroContent.status}
                    </span>
                  )}
                </div>

                {/* Genres */}
                {heroContent.genres && heroContent.genres.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-8">
                    {heroContent.genres.slice(0, 4).map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 bg-white/5 backdrop-blur-sm text-zinc-300 text-xs font-medium rounded-full border border-white/10"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <NavigationLink
                  href={`/${heroContent.mediaType.toLowerCase()}/${heroContent.id}`}
                  onClick={() =>
                    openDetails(
                      heroContent.mediaType as MediaType,
                      heroContent.id,
                    )
                  }
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-base rounded-xl hover:bg-zinc-200 transition-all duration-200 shadow-2xl"
                >
                  <svg
                    className="w-5 h-5"
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
                </NavigationLink>
              </div>

              {/* ── Right: Cover Image ── */}
              <div className="shrink-0 w-56 sm:w-64 md:w-72 lg:w-80">
                <div className="relative">
                  {/* Glow behind poster */}
                  <div className="absolute -inset-4 bg-linear-to-br from-purple-500/30 to-blue-500/30 rounded-3xl blur-2xl" />
                  <img
                    src={heroContent.coverImage || ''}
                    alt={heroContent.title}
                    className="relative w-full rounded-2xl shadow-2xl ring-1 ring-white/10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black to-transparent pointer-events-none" />
        </div>
      ) : null}

      {/* ── Trending Rows ── */}
      <div className="relative pb-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          {isLoading ? (
            <div className="space-y-14">
              <TrendingRowSkeleton />
              <TrendingRowSkeleton />
              <TrendingRowSkeleton />
              <TrendingRowSkeleton />
            </div>
          ) : (
            <div className="space-y-14">
              {/* Trending Anime */}
              {trendingAnime.length > 0 && (
                <section>
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-white">
                      Trending Anime
                    </h2>
                    <p className="text-zinc-500 text-sm mt-1">
                      {ANILIST_SEASON_LABEL[season]} {year} season
                    </p>
                  </div>
                  <SlidingMediaRow
                    mediaList={trendingAnime}
                    onMediaClick={openDetails}
                  />
                </section>
              )}

              {/* Trending Manga */}
              {trendingManga.length > 0 && (
                <section>
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-white">
                      Trending Manga
                    </h2>
                    <p className="text-zinc-500 text-sm mt-1">
                      Most popular right now
                    </p>
                  </div>
                  <SlidingMediaRow
                    mediaList={trendingManga}
                    onMediaClick={openDetails}
                  />
                </section>
              )}

              {/* Trending Movies */}
              {trendingMovies.length > 0 && (
                <section>
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-white">
                      Trending Movies
                    </h2>
                    <p className="text-zinc-500 text-sm mt-1">
                      This week's top films
                    </p>
                  </div>
                  <SlidingMediaRow
                    mediaList={trendingMovies}
                    onMediaClick={openDetails}
                  />
                </section>
              )}

              {/* Trending TV */}
              {trendingTv.length > 0 && (
                <section>
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-white">
                      Trending TV Shows
                    </h2>
                    <p className="text-zinc-500 text-sm mt-1">
                      This week's top series
                    </p>
                  </div>
                  <SlidingMediaRow
                    mediaList={trendingTv}
                    onMediaClick={openDetails}
                  />
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

