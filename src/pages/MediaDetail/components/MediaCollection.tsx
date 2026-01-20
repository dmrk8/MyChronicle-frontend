import type { MediaBelongsToCollection } from '../../../types/Media';

interface MediaCollectionProps {
  collection: MediaBelongsToCollection;
}

export const MediaCollection = ({ collection }: MediaCollectionProps) => {
  if (!collection) return null;

  return (
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">
        Part of Collection
      </h3>
      <div className="bg-zinc-900/50 rounded-lg overflow-hidden border border-zinc-700/50 hover:border-zinc-600 transition-colors cursor-pointer">
        <div className="relative h-48">
          {collection.backdropPath ? (
            <>
              <img
                src={collection.backdropPath}
                alt={collection.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <span className="text-zinc-600 text-4xl">🎬</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="text-lg font-semibold text-white mb-1">
              {collection.name}
            </div>
            <div className="text-xs text-zinc-300">
              View all movies in this collection
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
