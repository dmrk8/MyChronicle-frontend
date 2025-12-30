import { useParams, useNavigate } from 'react-router-dom';
import { useMediaDetail } from '../hooks/useMedia';
import type { MediaType } from '../types/Media';

const MediaDetailPage = () => {
  const { mediaType, id } = useParams<{ mediaType: MediaType; id: string }>();
  const navigate = useNavigate();

  const mediaId = id ? parseInt(id, 10) : undefined;

  const {
    data: media,
    isLoading,
    isError,
  } = useMediaDetail({
    mediaId,
    mediaType: mediaType as MediaType,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600 dark:text-gray-400">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (isError || !media) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-xl text-red-500">
            Failed to load media details
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isAnimeOrManga = mediaType === 'anime' || mediaType === 'manga';
  const isMovie = mediaType === 'movie';
  const isTv = mediaType === 'tv';

  const getScoreColor = (score?: number | null) => {
    if (!score) return 'text-zinc-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const formatDate = (date?: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount?: number | null) => {
    if (!amount) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-900 to-black text-white">
      {/* Banner Section */}
      {(media.bannerImage || media.coverImage) && (
        <div className="relative h-96 w-full">
          <img
            src={media.bannerImage || media.coverImage || ''}
            alt={media.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Sidebar - Cover Image, Buttons, and Info */}
          <div className="shrink-0 w-full md:w-64">
            {/* Cover Image */}
            <img
              src={media.coverImage || ''}
              alt={media.title}
              className="w-full rounded-lg shadow-2xl mb-4"
            />

            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                onClick={() => {
                  /* Add to library functionality */
                }}
              >
                Add to Library
              </button>
              <button
                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                onClick={() => {
                  /* Favorite functionality */
                }}
              >
                ❤️
              </button>
            </div>

            {/* Media Information */}
            <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
              {/* Anime/Manga Specific */}
              {isAnimeOrManga && (
                <>
                  {media.nextAiringEpisode && (
                    <InfoItem
                      label="Next Episode"
                      value={media.nextAiringEpisode}
                    />
                  )}
                  {media.episodes && (
                    <InfoItem label="Episodes" value={media.episodes} />
                  )}
                  {media.chapters && (
                    <InfoItem label="Chapters" value={media.chapters} />
                  )}
                  {media.volumes && (
                    <InfoItem label="Volumes" value={media.volumes} />
                  )}
                  {media.duration && (
                    <InfoItem
                      label="Duration"
                      value={`${media.duration} min/ep`}
                    />
                  )}

                  {media.season && media.seasonYear && (
                    <InfoItem
                      label="Season"
                      value={`${media.season} ${media.seasonYear}`}
                    />
                  )}
                  {media.startDate && (
                    <InfoItem
                      label="Start Date"
                      value={formatDate(media.startDate)}
                    />
                  )}
                  {media.endDate && (
                    <InfoItem
                      label="End Date"
                      value={formatDate(media.endDate)}
                    />
                  )}
                  {media.source && (
                    <InfoItem label="Source" value={media.source} />
                  )}
                  {media.countryOfOrigin && (
                    <InfoItem label="Country" value={media.countryOfOrigin} />
                  )}
                  {media.studios && media.studios.length > 0 && (
                    <InfoItem
                      label="Studios"
                      value={media.studios.join(', ')}
                    />
                  )}
                </>
              )}

              {/* Movie Specific */}
              {isMovie && (
                <>
                  {media.releaseDate && (
                    <InfoItem
                      label="Release Date"
                      value={formatDate(media.releaseDate)}
                    />
                  )}
                  {media.runtime && (
                    <InfoItem label="Runtime" value={`${media.runtime} min`} />
                  )}
                  {media.budget && (
                    <InfoItem
                      label="Budget"
                      value={formatCurrency(media.budget)}
                    />
                  )}
                  {media.revenue && (
                    <InfoItem
                      label="Revenue"
                      value={formatCurrency(media.revenue)}
                    />
                  )}
                  {media.countryOfOrigin && (
                    <InfoItem label="Country" value={media.countryOfOrigin} />
                  )}
                  {media.originalLanguage && (
                    <InfoItem
                      label="Language"
                      value={media.originalLanguage.toUpperCase()}
                    />
                  )}
                  {media.studios && media.studios.length > 0 && (
                    <InfoItem
                      label="Studios"
                      value={media.studios.join(', ')}
                    />
                  )}
                </>
              )}

              {/* TV Specific */}
              {isTv && (
                <>
                  {media.firstAirDate && (
                    <InfoItem
                      label="First Air Date"
                      value={formatDate(media.firstAirDate)}
                    />
                  )}
                  {media.lastAirDate && (
                    <InfoItem
                      label="Last Air Date"
                      value={formatDate(media.lastAirDate)}
                    />
                  )}
                  {media.numberOfSeasons && (
                    <InfoItem label="Seasons" value={media.numberOfSeasons} />
                  )}
                  {media.numberOfEpisodes && (
                    <InfoItem label="Episodes" value={media.numberOfEpisodes} />
                  )}
                  {media.episodeRunTime && (
                    <InfoItem
                      label="Episode Runtime"
                      value={`${media.episodeRunTime} min`}
                    />
                  )}
                  {media.createdBy && (
                    <InfoItem label="Created By" value={media.createdBy} />
                  )}
                  {media.type && <InfoItem label="Type" value={media.type} />}
                  {media.countryOfOrigin && (
                    <InfoItem label="Country" value={media.countryOfOrigin} />
                  )}
                  {media.originalLanguage && (
                    <InfoItem
                      label="Language"
                      value={media.originalLanguage.toUpperCase()}
                    />
                  )}
                  {media.studios && media.studios.length > 0 && (
                    <InfoItem
                      label="Studios"
                      value={media.studios.join(', ')}
                    />
                  )}
                </>
              )}
            </div>

            {/* Synonyms */}
            {media.synonyms && media.synonyms.length > 0 && (
              <div className="mt-4 bg-zinc-800/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-2 text-zinc-400">
                  Alternative Titles
                </h3>
                <div className="text-zinc-300 text-xs space-y-1">
                  {media.synonyms.map((synonym, index) => (
                    <div key={index}>{synonym}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Content - Main Info */}
          <div className="flex-1">
            {/* Title and Score */}
            <div className="mb-6 mt-10">
              <h1 className="text-4xl font-bold mb-2">{media.title}</h1>
              {media.averageScore && (
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl font-bold ${getScoreColor(
                      media.averageScore
                    )}`}
                  >
                    ★ {media.averageScore}
                  </span>
                  <span className="text-zinc-400">Average Score</span>
                </div>
              )}
            </div>

            {/* Status and Format */}
            <div className="flex flex-wrap gap-2 mb-6">
              {media.status && (
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-sm">
                  {media.status}
                </span>
              )}
              {media.format && (
                <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-sm">
                  {media.format.toUpperCase()}
                  {mediaType === 'manga' && media.countryOfOrigin && (
                    <> ({media.countryOfOrigin})</>
                  )}
                </span>
              )}
              {media.isAdult && (
                <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-sm text-red-400">
                  18+
                </span>
              )}
            </div>

            {/* Description */}
            {media.description && (
              <div className="mb-8">
                <p
                  className="text-zinc-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: media.description }}
                />
              </div>
            )}

            {/* Genres */}
            {media.genres && media.genres.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {media.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for info items
const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) => {
  if (value === null || value === undefined) return null;

  return (
    <div className="border-b border-zinc-700/50 pb-2 last:border-b-0">
      <div className="text-zinc-400 text-xs mb-1">{label}</div>
      <div className="text-white text-sm font-medium wrap-break-word">
        {value}
      </div>
    </div>
  );
};

export default MediaDetailPage;
