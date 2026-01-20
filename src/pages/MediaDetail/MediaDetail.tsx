import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  FaHeart,
  FaRegHeart,
  FaChevronDown,
  FaPlus,
  FaCheckCircle,
  FaTimes,
} from 'react-icons/fa';
import {
  useGetUserMediaEntryByExternalId,
  useCreateUserMediaEntry,
  useUpdateUserMediaEntry,
  useDeleteUserMediaEntry,
} from '../../hooks/useUserMediaEntry';
import { MediaExternalSource, MediaType } from '../../constants/mediaConstants';
import { MediaInfo } from './components/MediaInfo';
import { MainMediaInfo } from './components/MainMediaInfo';
import { UserMediaEntryStatus } from '../../types/UserMediaEntry';
import { useAnimeDetail, useMangaDetail } from '../../hooks/useAnilist';
import { useTmdbMovieDetail, useTmdbTvDetail } from '../../hooks/useTmdb';
import type {
  AnimeDetailed,
  MangaDetailed,
  MovieDetailed,
  TVDetailed,
} from '../../types/Media';
import { MediaTags } from './components/MediaTags';
import { MediaAlternativeTitles } from './components/MediaAlternativeTitles';
import { MediaTabs } from './components/MediaTabs';

export const MediaDetailPage = () => {
  const { mediaType: rawMediaType, id } = useParams<{
    mediaType: string;
    id: string;
  }>();
  const navigate = useNavigate();
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const mediaType = rawMediaType?.toUpperCase() as MediaType;
  const mediaId = id ? parseInt(id, 10) : undefined;

  const validMediaTypes = Object.values(MediaType);
  const isValidMediaType = mediaType && validMediaTypes.includes(mediaType);

  const animeQuery = useAnimeDetail(mediaId, {
    enabled: mediaType === MediaType.ANIME && isValidMediaType,
  });
  const mangaQuery = useMangaDetail(mediaId, {
    enabled: mediaType === MediaType.MANGA && isValidMediaType,
  });
  const movieQuery = useTmdbMovieDetail(mediaId, undefined, {
    enabled: mediaType === MediaType.MOVIE && isValidMediaType,
  });
  const tvQuery = useTmdbTvDetail(mediaId, undefined, {
    enabled: mediaType === MediaType.TV && isValidMediaType,
  });

  const activeQuery =
    mediaType === MediaType.ANIME
      ? animeQuery
      : mediaType === MediaType.MANGA
        ? mangaQuery
        : mediaType === MediaType.MOVIE
          ? movieQuery
          : mediaType === MediaType.TV
            ? tvQuery
            : { data: null, isLoading: false, isError: true };

  const { data: media, isLoading, isError } = activeQuery;

  const { data: userEntry } = useGetUserMediaEntryByExternalId(
    mediaId,
    media?.externalSource,
  );

  const createEntry = useCreateUserMediaEntry();
  const updateEntry = useUpdateUserMediaEntry();
  const deleteEntry = useDeleteUserMediaEntry();

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

  const handleToggleFavorite = async () => {
    if (!mediaId) return;
    if (!userEntry) return;

    await updateEntry.mutateAsync({
      entryId: userEntry.id!,
      update: {
        isFavorite: !userEntry.isFavorite,
      },
    });
  };

  const handleStatusChange = async (status: UserMediaEntryStatus) => {
    if (!mediaId || !media) return;

    if (userEntry) {
      await updateEntry.mutateAsync({
        entryId: userEntry.id!,
        update: {
          status,
        },
      });
    } else {
      await createEntry.mutateAsync({
        externalId: mediaId,
        mediaType: media?.mediaType as MediaType,
        title: media?.title ?? undefined,
        coverImage: media.coverImage ?? undefined,
        externalSource: media?.externalSource as MediaExternalSource,
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

    try {
      await deleteEntry.mutateAsync({
        entryId: userEntry.id,
        externalId: mediaId,
      });
      setShowStatusDropdown(false);
      setShowRemoveConfirm(false);
    } catch (error) {
      console.error('Failed to remove from library:', error);
    }
  };

  const statusConfig = {
    [UserMediaEntryStatus.PLANNING]: {
      label: 'Planning',
      color: 'text-yellow-400',
    },
    [UserMediaEntryStatus.CURRENT]: {
      label: 'Current',
      color: 'text-blue-400',
    },
    [UserMediaEntryStatus.ON_HOLD]: {
      label: 'On Hold',
      color: 'text-orange-400',
    },
    [UserMediaEntryStatus.COMPLETED]: {
      label: 'Completed',
      color: 'text-green-400',
    },
    [UserMediaEntryStatus.DROPPED]: {
      label: 'Dropped',
      color: 'text-red-400',
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

  // NOW you can have early returns
  if (!isValidMediaType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-xl text-red-500">Invalid media type</div>
          <button
            onClick={() => navigate('/home')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-900 to-black text-white mb-30">
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
                  userEntry ? 'flex-1' : 'w-full'
                }`}
                ref={dropdownRef}
              >
                <button
                  className={`w-full px-4 py-2.5 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border ${
                    userEntry
                      ? 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-white'
                      : 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/50 hover:border-zinc-600 text-zinc-300'
                  }`}
                  onClick={handleLibraryClick}
                >
                  {userEntry && userEntry.status ? (
                    <>
                      <span className={statusConfig[userEntry.status].color}>
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
                          handleStatusChange(status as UserMediaEntryStatus)
                        }
                        className={`w-full px-4 py-2.5 text-left hover:bg-zinc-700 transition-colors flex items-center gap-3 ${
                          userEntry?.status === status ? 'bg-zinc-700/50' : ''
                        }`}
                      >
                        <span className={config.color}>{config.label}</span>
                        {userEntry?.status === status && (
                          <FaCheckCircle
                            size={12}
                            className="ml-auto text-green-400"
                          />
                        )}
                      </button>
                    ))}

                    {/* Remove from Library Option */}
                    {userEntry && (
                      <>
                        <div className="border-t border-zinc-700" />
                        <button
                          onClick={() => {
                            setShowStatusDropdown(false);
                            setShowRemoveConfirm(true);
                          }}
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

            <MediaInfo
              anime={
                mediaType === MediaType.ANIME
                  ? (media as AnimeDetailed)
                  : undefined
              }
              manga={
                mediaType === MediaType.MANGA
                  ? (media as MangaDetailed)
                  : undefined
              }
              movie={
                mediaType === MediaType.MOVIE
                  ? (media as MovieDetailed)
                  : undefined
              }
              tv={
                mediaType === MediaType.TV ? (media as TVDetailed) : undefined
              }
            />
            <MediaTags
              anime={
                mediaType === MediaType.ANIME
                  ? (media as AnimeDetailed)
                  : undefined
              }
              manga={
                mediaType === MediaType.MANGA
                  ? (media as MangaDetailed)
                  : undefined
              }
              movie={
                mediaType === MediaType.MOVIE
                  ? (media as MovieDetailed)
                  : undefined
              }
              tv={
                mediaType === MediaType.TV ? (media as TVDetailed) : undefined
              }
            />
            <MediaAlternativeTitles
              anime={
                mediaType === MediaType.ANIME
                  ? (media as AnimeDetailed)
                  : undefined
              }
              manga={
                mediaType === MediaType.MANGA
                  ? (media as MangaDetailed)
                  : undefined
              }
              movie={
                mediaType === MediaType.MOVIE
                  ? (media as MovieDetailed)
                  : undefined
              }
              tv={
                mediaType === MediaType.TV ? (media as TVDetailed) : undefined
              }
            />
          </div>

          {/* Right Side - Main Content */}
          <div className="flex-1 space-y-6">
            <MainMediaInfo media={media} />

            <MediaTabs
              anime={
                mediaType === MediaType.ANIME
                  ? (media as AnimeDetailed)
                  : undefined
              }
              manga={
                mediaType === MediaType.MANGA
                  ? (media as MangaDetailed)
                  : undefined
              }
              movie={
                mediaType === MediaType.MOVIE
                  ? (media as MovieDetailed)
                  : undefined
              }
              tv={
                mediaType === MediaType.TV ? (media as TVDetailed) : undefined
              }
              mediaType={mediaType!}
              mediaTitle={media.title}
              userMediaEntryId={userEntry?.id}
            />
          </div>
        </div>
      </div>

      {showRemoveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-linear-to-br from-zinc-800 to-zinc-900 rounded-2xl border-2 border-zinc-700 shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-linear-to-r from-red-500/20 to-orange-500/20 border-b border-red-500/30 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <FaTimes className="text-red-400" />
                Remove from Library?
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-zinc-300 text-sm">
                Are you sure you want to remove{' '}
                <span className="font-semibold text-white">{media?.title}</span>{' '}
                from your library? This will also delete all associated reviews
                and progress data. This action cannot be undone.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleRemoveFromLibrary}
                  disabled={deleteEntry.isPending}
                  className="flex-1 px-4 py-3 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-zinc-700 disabled:to-zinc-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-red-500/20 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {deleteEntry.isPending ? 'Removing...' : 'Yes, Remove'}
                </button>
                <button
                  onClick={() => setShowRemoveConfirm(false)}
                  disabled={deleteEntry.isPending}
                  className="flex-1 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaDetailPage;
