import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTmdbCollectionDetail } from '../../../hooks/useTmdb';
import type { MediaBelongsToCollection } from '../../../types/Media';
import {
  ChevronRightIcon,
  ChevronUpIcon,
  FilmIcon,
} from '@heroicons/react/24/outline';

interface MediaCollectionProps {
  collection: MediaBelongsToCollection;
}

export const MediaCollection = ({ collection }: MediaCollectionProps) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const { data: collectionDetails, isLoading } = useTmdbCollectionDetail(
    collection.id,
    undefined,
    { enabled: expanded },
  );

  const handleNavigate = (id: number, mediaType: string) => {
    navigate(`/${mediaType.toLowerCase()}/${id}`);
  };

  if (!collection) return null;

  return (
    <div className="bg-white/4 backdrop-blur-sm border border-white/10 rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">
        Part of Collection
      </h3>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-white/3 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-colors"
      >
        <div className="relative h-48">
          {collection.backdropPath ? (
            <>
              <img
                src={collection.backdropPath}
                alt={collection.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <FilmIcon className="w-10 h-10 text-zinc-600" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-left flex items-end justify-between">
            <div className="text-lg font-semibold text-white mb-1">
              {collection.name}
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-400">
              {expanded ? (
                <>
                  <span>Collapse</span>
                  <ChevronUpIcon className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>View all</span>
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                </>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Expanded Collection Details */}
      {expanded && (
        <div className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-zinc-500 text-sm">
              <div className="text-white">Loading collection details...</div>
            </div>
          ) : collectionDetails ? (
            <>
              {/* Overview */}
              {collectionDetails.overview && (
                <div className="bg-white/3 rounded-xl p-4 border border-white/10">
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {collectionDetails.overview}
                  </p>
                </div>
              )}

              {/* Movies Grid */}
              {collectionDetails.parts &&
                collectionDetails.parts.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-white mb-3">
                      Movies in Collection ({collectionDetails.parts.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {collectionDetails.parts.map((part) => (
                        <button
                          key={part.id}
                          onClick={() =>
                            handleNavigate(part.id, part.mediaType)
                          }
                          className="group relative rounded-lg overflow-hidden bg-zinc-900/50 border border-zinc-700/50 hover:border-white/25 transition-all hover:scale-105"
                        >
                          {part.posterPath || part.backdropPath ? (
                            <img
                              src={part.posterPath || part.backdropPath}
                              alt={part.title}
                              className="w-full aspect-2/3 object-cover"
                            />
                          ) : (
                            <div className="w-full aspect-2/3 bg-zinc-800 flex items-center justify-center">
                              <FilmIcon className="w-6 h-6 text-zinc-600" />
                            </div>
                          )}

                          {/* Title and year overlay */}
                          <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                            <div className="text-xs text-white font-semibold line-clamp-2 mb-1">
                              {part.title}
                            </div>
                            {part.releaseDate && (
                              <div className="text-[10px] text-white">
                                {new Date(part.releaseDate).getFullYear()}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
