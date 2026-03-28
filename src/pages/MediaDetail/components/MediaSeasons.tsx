import { useState } from 'react';
import type { MediaSeason } from '../../../types/Media';
import { ChevronLeftIcon, TvIcon } from '@heroicons/react/24/outline';

interface MediaSeasonsProps {
  seasons: MediaSeason[];
}

const SeasonCard = ({
  season,
  compact = false,
}: {
  season: MediaSeason;
  compact?: boolean;
}) => (
  <div className={`flex gap-4 ${compact ? '' : 'p-4'}`}>
    {season.posterPath ? (
      <img
        src={season.posterPath}
        alt={season.name}
        className={`${compact ? 'w-20 h-30' : 'w-24 h-36'} object-cover rounded-lg shrink-0`}
      />
    ) : (
      <div
        className={`${compact ? 'w-20 h-30' : 'w-24 h-36'} bg-white/5 flex items-center justify-center rounded-lg shrink-0`}
      >
        <TvIcon className="w-8 h-8 text-zinc-600" />
      </div>
    )}
    <div className="flex-1 min-w-0 text-left">
      <div
        className={`font-semibold text-white mb-1 ${compact ? 'text-sm' : 'text-base'}`}
      >
        {season.name}
      </div>
      <div className={`text-zinc-400 mb-2 ${compact ? 'text-xs' : 'text-sm'}`}>
        {season.episodeCount} episodes
        {season.airDate && ` • ${new Date(season.airDate).getFullYear()}`}
      </div>
      {season.overview && (
        <div
          className={`text-zinc-400 line-clamp-3 ${compact ? 'text-sm' : 'text-sm'}`}
        >
          {season.overview}
        </div>
      )}
    </div>
  </div>
);

export const MediaSeasons = ({ seasons }: MediaSeasonsProps) => {
  const [showAllSeasons, setShowAllSeasons] = useState(false);

  if (!seasons || seasons.length === 0) return null;

  // Filter out specials and get the last season
  const regularSeasons = seasons.filter((season) => season.seasonNumber > 0);
  const lastSeason = regularSeasons[regularSeasons.length - 1];

  if (!lastSeason) return null;

  return (
    <div className="bg-white/4 backdrop-blur-sm border border-white/10 rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Last Season</h3>

      {!showAllSeasons ? (
        // Collapsed view - show only last season
        <button
          onClick={() => setShowAllSeasons(true)}
          className="w-full bg-white/3 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-colors p-4"
        >
          <SeasonCard season={lastSeason} />
          <div className="text-xs text-gray-400 mt-3 text-left">
            View all {regularSeasons.length} seasons →
          </div>
        </button>
      ) : (
        <div className="space-y-3">
          <button
            onClick={() => setShowAllSeasons(false)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-1"
          >
            <ChevronLeftIcon className="w-3 h-3" />
            Back to last season
          </button>
          {regularSeasons.map((season) => (
            <div
              key={season.seasonNumber}
              className="bg-white/3 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-colors p-4"
            >
              <SeasonCard season={season} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
