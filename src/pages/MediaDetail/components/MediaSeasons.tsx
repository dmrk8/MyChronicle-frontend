import { useState } from 'react';
import type { MediaSeason } from '../../../types/Media';

interface MediaSeasonsProps {
  seasons: MediaSeason[];
}

export const MediaSeasons = ({ seasons }: MediaSeasonsProps) => {
  const [showAllSeasons, setShowAllSeasons] = useState(false);

  if (!seasons || seasons.length === 0) return null;

  // Filter out specials and get the last season
  const regularSeasons = seasons.filter((season) => season.seasonNumber > 0);
  const lastSeason = regularSeasons[regularSeasons.length - 1];

  if (!lastSeason) return null;

  return (
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Last Season</h3>

      {!showAllSeasons ? (
        // Collapsed view - show only last season
        <button
          onClick={() => setShowAllSeasons(true)}
          className="w-full bg-zinc-900/50 rounded-lg overflow-hidden border border-zinc-700/50 hover:border-zinc-600 transition-colors"
        >
          <div className="flex gap-4 p-4">
            {lastSeason.posterPath ? (
              <img
                src={lastSeason.posterPath}
                alt={lastSeason.name}
                className="w-24 h-36 object-cover rounded flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-36 bg-zinc-800 flex items-center justify-center rounded flex-shrink-0">
                <span className="text-zinc-600 text-3xl">📺</span>
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <div className="text-lg font-semibold text-white mb-2">
                {lastSeason.name}
              </div>
              <div className="text-sm text-zinc-300 mb-3">
                {lastSeason.episodeCount} episodes
                {lastSeason.airDate &&
                  ` • ${new Date(lastSeason.airDate).getFullYear()}`}
              </div>
              {lastSeason.overview && (
                <div className="text-sm text-zinc-400 line-clamp-3 mb-3">
                  {lastSeason.overview}
                </div>
              )}
              <div className="text-sm text-emerald-400">
                Click to view all {regularSeasons.length} seasons →
              </div>
            </div>
          </div>
        </button>
      ) : (
        // Expanded view - show all seasons
        <div className="space-y-3">
          <button
            onClick={() => setShowAllSeasons(false)}
            className="text-sm text-emerald-400 hover:text-emerald-300 mb-2 flex items-center gap-2"
          >
            ← Back to last season
          </button>
          {regularSeasons.map((season) => (
            <div
              key={season.seasonNumber}
              className="bg-zinc-900/50 rounded-lg overflow-hidden border border-zinc-700/50 hover:border-zinc-600 transition-colors"
            >
              <div className="flex gap-4 p-4">
                {season.posterPath ? (
                  <img
                    src={season.posterPath}
                    alt={season.name}
                    className="w-20 h-30 object-cover rounded flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-30 bg-zinc-800 flex items-center justify-center rounded flex-shrink-0">
                    <span className="text-zinc-600 text-2xl">📺</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white mb-1">
                    {season.name}
                  </div>
                  <div className="text-xs text-zinc-400 mb-2">
                    {season.episodeCount} episodes
                    {season.airDate &&
                      ` • ${new Date(season.airDate).getFullYear()}`}
                  </div>
                  {season.overview && (
                    <div className="text-xs text-zinc-300 line-clamp-3">
                      {season.overview}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
