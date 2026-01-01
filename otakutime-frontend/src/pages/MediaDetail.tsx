import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  FaHeart,
  FaRegHeart,
  FaChevronDown,
  FaPlus,
  FaClock,
  FaPlay,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
} from 'react-icons/fa';
import { useMediaDetail } from '../hooks/useMedia';
import {
  useGetUserMediaEntryByExternalId,
  useCreateUserMediaEntry,
  useUpdateUserMediaEntry,
  useDeleteUserMediaEntry,
} from '../hooks/useUserMediaEntry';
import {
  ReviewStatus,
  ReviewMediaSource,
  ReviewMediaType,
} from '../types/UserMediaEntry';
import type { MediaType } from '../types/Media';
import React from 'react';
import { getUserMediaEntryByExternalId } from '../api/userMediaEntryApi';

const MediaDetailPage = () => {
  const { mediaType, id } = useParams<{ mediaType: MediaType; id: string }>();
  const navigate = useNavigate();
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const mediaId = id ? parseInt(id, 10) : undefined;

  const {
    data: media,
    isLoading,
    isError,
  } = useMediaDetail({
    mediaId,
    mediaType: mediaType as MediaType,
  });

  // Get user media entry
  const { data: userEntryData } = useGetUserMediaEntryByExternalId(
    mediaId || 0
  );
  const userEntry =
    userEntryData?.data && !Array.isArray(userEntryData.data)
      ? userEntryData.data
      : null;

  const createEntry = useCreateUserMediaEntry();
  const updateEntry = useUpdateUserMediaEntry();
  const deleteEntry = useDeleteUserMediaEntry();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Map media type to ReviewMediaType
  const getReviewMediaType = (type: MediaType): ReviewMediaType => {
    const mapping: Record<MediaType, ReviewMediaType> = {
      anime: ReviewMediaType.ANIME,
      manga: ReviewMediaType.MANGA,
      movie: ReviewMediaType.MOVIE,
      tv: ReviewMediaType.TV,
    };
    return mapping[type];
  };

  // Map media type to ReviewMediaSource
  const getReviewMediaSource = (type: MediaType): ReviewMediaSource => {
    if (type === 'anime' || type === 'manga') return ReviewMediaSource.ANILIST;
    return ReviewMediaSource.TMDB;
  };

  const handleToggleFavorite = async () => {
    if (!mediaId) return;

    if (userEntry) {
      // Check if this is the only property set (besides id, userId, etc.)
      const isFavoriteOnly = userEntry.isFavorite && !userEntry.inLibrary;

      if (isFavoriteOnly) {
        // Delete the entry entirely if favorite is the only thing set and we're unfavoriting
        await deleteEntry.mutateAsync({
          entryId: userEntry.id!,
          externalId: mediaId,
        });
      } else {
        // Update existing entry - toggle favorite
        await updateEntry.mutateAsync({
          entryId: userEntry.id!,
          update: {
            isFavorite: !userEntry.isFavorite,
          },
          externalId: mediaId,
        });
      }
    } else {
      // Create new entry with favorite
      await createEntry.mutateAsync({
        externalId: mediaId,
        externalSource: getReviewMediaSource(mediaType as MediaType),
        mediaType: getReviewMediaType(mediaType as MediaType),
        isFavorite: true,
        inLibrary: false,
      });
    }
  };

  const handleStatusChange = async (
    status: (typeof ReviewStatus)[keyof typeof ReviewStatus]
  ) => {
    if (!mediaId) return;

    if (userEntry) {
      // Update existing entry
      await updateEntry.mutateAsync({
        entryId: userEntry.id!,
        update: {
          status,
          inLibrary: true,
        },
        externalId: mediaId, // Pass externalId
      });
    } else {
      // Create new entry with status
      await createEntry.mutateAsync({
        externalId: mediaId,
        externalSource: getReviewMediaSource(mediaType as MediaType),
        mediaType: getReviewMediaType(mediaType as MediaType),
        status,
        inLibrary: true,
      });
    }
    setShowStatusDropdown(false);
  };

  const handleLibraryClick = () => {
    setShowStatusDropdown(!showStatusDropdown);
  };

  const handleRemoveFromLibrary = async () => {
    if (!userEntry?.id) return;

    // Check if favorite is set
    if (userEntry.isFavorite) {
      // Just remove from library but keep as favorite
      await updateEntry.mutateAsync({
        entryId: userEntry.id,
        update: {
          inLibrary: false,
          status: undefined,
        },
        externalId: mediaId,
      });
    } else {
      // Delete the entry entirely if not favorited
      await deleteEntry.mutateAsync({
        entryId: userEntry.id,
        externalId: mediaId,
      });
    }
    setShowStatusDropdown(false);
  };

  const statusConfig = {
    [ReviewStatus.PLANNING]: {
      label: 'Planning',
      color: 'text-yellow-400',
      icon: FaClock,
    },
    [ReviewStatus.CURRENT]: {
      label: 'Current',
      color: 'text-blue-400',
      icon: FaPlay,
    },
    [ReviewStatus.COMPLETED]: {
      label: 'Completed',
      color: 'text-green-400',
      icon: FaCheckCircle,
    },
    [ReviewStatus.DROPPED]: {
      label: 'Dropped',
      color: 'text-red-400',
      icon: FaTimesCircle,
    },
  };

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
              {/* Library Button with Dropdown */}
              <div
                className={`relative transition-all duration-300 ${
                  userEntry?.inLibrary ? 'flex-1' : 'w-full'
                }`}
                ref={dropdownRef}
              >
                <button
                  className={`w-full px-4 py-2.5 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border ${
                    userEntry?.inLibrary
                      ? 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-white'
                      : 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/50 hover:border-zinc-600 text-zinc-300'
                  }`}
                  onClick={handleLibraryClick}
                >
                  {userEntry?.inLibrary && userEntry.status ? (
                    <>
                      <span className={statusConfig[userEntry.status].color}>
                        {React.createElement(
                          statusConfig[userEntry.status].icon,
                          { size: 14 }
                        )}
                      </span>
                      <span className="text-sm">
                        {statusConfig[userEntry.status].label}
                      </span>
                    </>
                  ) : (
                    <>
                      <FaPlus size={14} />
                      <span className="text-sm">Add to Library</span>
                    </>
                  )}
                  <FaChevronDown
                    size={10}
                    className={`transition-transform duration-200 ${
                      showStatusDropdown ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showStatusDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 rounded-lg shadow-2xl border border-zinc-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <button
                        key={status}
                        onClick={() =>
                          handleStatusChange(
                            status as (typeof ReviewStatus)[keyof typeof ReviewStatus]
                          )
                        }
                        className={`w-full px-4 py-2.5 text-left hover:bg-zinc-700 transition-colors flex items-center gap-3 ${
                          userEntry?.status === status ? 'bg-zinc-700/50' : ''
                        }`}
                      >
                        <span className={config.color}>
                          {React.createElement(config.icon, { size: 14 })}
                        </span>
                        <span className="text-white text-sm font-medium">
                          {config.label}
                        </span>
                        {userEntry?.status === status && (
                          <FaCheckCircle
                            size={12}
                            className="ml-auto text-green-400"
                          />
                        )}
                      </button>
                    ))}

                    {/* Remove from Library Option */}
                    {userEntry?.inLibrary && (
                      <>
                        <div className="border-t border-zinc-700" />
                        <button
                          onClick={handleRemoveFromLibrary}
                          className="w-full px-4 py-2.5 text-left hover:bg-zinc-700 transition-colors flex items-center gap-3 text-red-400"
                        >
                          <FaTimes size={14} />
                          <span className="text-sm font-medium">
                            Remove from Library
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Favorite Button - Only show when in library */}
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  userEntry?.inLibrary
                    ? 'w-12 opacity-100'
                    : 'w-0 opacity-0 pointer-events-none'
                }`}
              >
                <button
                  className={`w-12 h-full px-3 py-2.5 rounded-lg transition-all duration-200 border ${
                    userEntry?.isFavorite
                      ? 'bg-red-500/20 hover:bg-red-500/30 border-red-500/50 hover:border-red-500 text-red-400'
                      : 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/50 hover:border-zinc-600 text-zinc-400'
                  }`}
                  onClick={handleToggleFavorite}
                  title={
                    userEntry?.isFavorite
                      ? 'Remove from favorites'
                      : 'Add to favorites'
                  }
                  disabled={!userEntry?.inLibrary}
                >
                  {userEntry?.isFavorite ? (
                    <FaHeart size={16} />
                  ) : (
                    <FaRegHeart size={16} />
                  )}
                </button>
              </div>
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
                    <InfoItem label="Start Date" value={media.startDate} />
                  )}
                  {media.endDate && (
                    <InfoItem label="End Date" value={media.endDate} />
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
