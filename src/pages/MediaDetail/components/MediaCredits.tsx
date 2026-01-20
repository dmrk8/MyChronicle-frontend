import type { MediaCast } from '../../../types/Media';

interface MediaCreditsProps {
  credits: MediaCast[];
}

export const MediaCredits = ({ credits }: MediaCreditsProps) => {
  if (!credits || credits.length === 0) return null;

  return (
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Cast & Crew</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {credits.slice(0, 12).map((cast, index) => (
          <div
            key={index}
            className="bg-zinc-900/50 rounded-lg overflow-hidden border border-zinc-700/50 hover:border-zinc-600 transition-colors"
          >
            <div className="flex">
              {/* Actor Image */}
              <div className="w-20 h-24 shrink-0 bg-zinc-800">
                {cast.castImage ? (
                  <img
                    src={cast.castImage}
                    alt={cast.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <span className="text-2xl">👤</span>
                  </div>
                )}
              </div>

              {/* Cast Info */}
              <div className="flex-1 p-3 flex flex-col justify-center">
                <div className="text-sm text-white font-medium line-clamp-1">
                  {cast.name}
                </div>
                {cast.character && (
                  <div className="text-xs text-zinc-400 mt-1 line-clamp-2">
                    as {cast.character}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
