import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTmdbCollectionDetail } from '../../../hooks/useTmdb';
import type { MediaBelongsToCollection } from '../../../types/Media';

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
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">
        Part of Collection
      </h3>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-zinc-900/50 rounded-lg overflow-hidden border border-zinc-700/50 hover:border-zinc-600 transition-colors"
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
              <span className="text-zinc-600 text-4xl">🎬</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
            <div className="text-lg font-semibold text-white mb-1">
              {collection.name}
            </div>
            <div className="text-xs text-emerald-400 font-medium hover:text-emerald-300 transition-colors flex items-center gap-1">
              {expanded
                ? 'Click to collapse'
                : 'View all movies in this collection'}
              <span className="text-sm">{expanded ? '▲' : '→'}</span>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded Collection Details */}
      {expanded && (
        <div className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-white">Loading collection details...</div>
            </div>
          ) : collectionDetails ? (
            <>
              {/* Overview */}
              {collectionDetails.overview && (
                <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700/50">
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
                          className="group relative rounded-lg overflow-hidden bg-zinc-900/50 border border-zinc-700/50 hover:border-emerald-500 transition-all hover:scale-105"
                        >
                          {part.posterPath || part.backdropPath ? (
                            <img
                              src={part.posterPath || part.backdropPath}
                              alt={part.title}
                              className="w-full aspect-2/3 object-cover"
                            />
                          ) : (
                            <div className="w-full aspect-2/3 bg-zinc-800 flex items-center justify-center">
                              <span className="text-zinc-600 text-2xl">🎬</span>
                            </div>
                          )}

                          {/* Title and year overlay */}
                          <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                            <div className="text-xs text-white font-semibold line-clamp-2 mb-1">
                              {part.title}
                            </div>
                            {part.releaseDate && (
                              <div className="text-[10px] text-emerald-400">
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
