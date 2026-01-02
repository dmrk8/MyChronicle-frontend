import React from 'react';
import type { MediaDetailed } from '../../../types/Media';

interface InfoItemProps {
  label: string;
  value: string | number | null;
}

const InfoItem = ({ label, value }: InfoItemProps) => {
  if (value === null || value === undefined) return null;

  return (
    <div className="border-b border-zinc-700/50 pb-2 last:border-b-0">
      {' '}
      <div className="text-zinc-400 text-xs mb-1">{label}</div>{' '}
      <div className="text-white text-sm font-medium wrap-break-word">
        {value}
      </div>
    </div>
  );
};

interface MediaInfoProps {
  media: MediaDetailed;
}

export const MediaInfo = ({ media }: MediaInfoProps) => {
  const mediaType = media.mediaType;
  const isAnimeOrManga = mediaType === 'ANIME' || mediaType === 'manga';
  const isMovie = mediaType === 'movie';
  const isTv = mediaType === 'tv';

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
    <>
      <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
        {/* Anime/Manga Specific */}
        {isAnimeOrManga && (
          <>
            {media.nextAiringEpisode && (
              <InfoItem label="Next Episode" value={media.nextAiringEpisode} />
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
              <InfoItem label="Duration" value={`${media.duration} min/ep`} />
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
            {media.source && <InfoItem label="Source" value={media.source} />}
            {media.countryOfOrigin && (
              <InfoItem label="Country" value={media.countryOfOrigin} />
            )}
            {media.studios && media.studios.length > 0 && (
              <InfoItem label="Studios" value={media.studios.join(', ')} />
            )}
          </>
        )}

        {/* Movie Specific */}
        {isMovie && (
          <>
            {media.releaseDate && (
              <InfoItem label="Release Date" value={media.releaseDate} />
            )}
            {media.runtime && (
              <InfoItem label="Runtime" value={`${media.runtime} min`} />
            )}
            {media.budget && (
              <InfoItem label="Budget" value={formatCurrency(media.budget)} />
            )}
            {media.revenue && (
              <InfoItem label="Revenue" value={formatCurrency(media.revenue)} />
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
              <InfoItem label="Studios" value={media.studios.join(', ')} />
            )}
          </>
        )}

        {/* TV Specific */}
        {isTv && (
          <>
            {media.firstAirDate && (
              <InfoItem label="First Air Date" value={media.firstAirDate} />
            )}
            {media.lastAirDate && (
              <InfoItem label="Last Air Date" value={media.lastAirDate} />
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
              <InfoItem label="Studios" value={media.studios.join(', ')} />
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
            {media.synonyms.map((synonym: string, index: number) => (
              <div key={index}>{synonym}</div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
