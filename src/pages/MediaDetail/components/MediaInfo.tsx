import type {
  AnimeDetailed,
  MangaDetailed,
  MediaStudio,
  MovieDetailed,
  TVDetailed,
} from '../../../types/Media';

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
      <div className="text-white text-sm font-medium wrap-break-word whitespace-pre-line">
        {value}
      </div>
    </div>
  );
};

interface MediaInfoProps {
  anime?: AnimeDetailed;
  manga?: MangaDetailed;
  movie?: MovieDetailed;
  tv?: TVDetailed;
}

export const MediaInfo = ({ anime, manga, movie, tv }: MediaInfoProps) => {
  const media = anime || manga || movie || tv;
  if (!media) return null;

  const formatCurrency = (amount?: number | null) => {
    if (!amount) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  return (
    <>
      <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
        {/* Anime Specific */}
        {anime && (
          <>
            {anime.nextAiringEpisode && (
              <InfoItem
                label="Next Episode"
                value={
                  anime.nextAiringEpisode.timeUntilAiring! / 3600 < 24
                    ? `Episode ${anime.nextAiringEpisode.episode} airs in ${Math.floor(anime.nextAiringEpisode.timeUntilAiring! / 3600)} hours`
                    : `Episode ${anime.nextAiringEpisode.episode} airs on ${new Date(
                        anime.nextAiringEpisode.airingAt! * 1000,
                      ).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}`
                }
              />
            )}
            {anime.episodes && (
              <InfoItem label="Episodes" value={anime.episodes} />
            )}
            {anime.duration && (
              <InfoItem label="Duration" value={`${anime.duration} min/ep`} />
            )}
            {anime.season && anime.seasonYear && (
              <InfoItem
                label="Season"
                value={`${anime.season} ${anime.seasonYear}`}
              />
            )}
            {anime.startDate && (
              <InfoItem label="Start Date" value={anime.startDate} />
            )}
            {anime.endDate && (
              <InfoItem label="End Date" value={anime.endDate} />
            )}
            {anime.source && <InfoItem label="Source" value={anime.source} />}
            {anime.countryOfOrigin && (
              <InfoItem label="Country" value={anime.countryOfOrigin} />
            )}

            {(() => {
              const mainStudio = anime.studios?.find(
                (s: MediaStudio) => s.isMain,
              );
              const producers =
                anime.studios
                  ?.filter((s: MediaStudio) => !s.isMain)
                  .map((s: MediaStudio) => s.name) || [];
              return (
                <>
                  {mainStudio && (
                    <InfoItem label="Studio" value={mainStudio.name} />
                  )}
                  {producers.length > 0 && (
                    <InfoItem label="Producers" value={producers.join('\n')} />
                  )}
                </>
              );
            })()}
          </>
        )}

        {/* Manga Specific */}
        {manga && (
          <>
            {manga.chapters && (
              <InfoItem label="Chapters" value={manga.chapters} />
            )}
            {manga.volumes && (
              <InfoItem label="Volumes" value={manga.volumes} />
            )}
            {manga.startDate && (
              <InfoItem label="Start Date" value={manga.startDate} />
            )}
            {manga.endDate && (
              <InfoItem label="End Date" value={manga.endDate} />
            )}
            {manga.source && <InfoItem label="Source" value={manga.source} />}
            {manga.countryOfOrigin && (
              <InfoItem label="Country" value={manga.countryOfOrigin} />
            )}
          </>
        )}

        {/* Movie Specific */}
        {movie && (
          <>
            {movie.releaseDate && (
              <InfoItem
                label="Release Date"
                value={formatDate(movie.releaseDate)}
              />
            )}
            {movie.runtime && (
              <InfoItem label="Runtime" value={`${movie.runtime} min`} />
            )}
            {movie.budget && (
              <InfoItem label="Budget" value={formatCurrency(movie.budget)} />
            )}
            {movie.revenue && (
              <InfoItem label="Revenue" value={formatCurrency(movie.revenue)} />
            )}
            {movie.originCountry && movie.originCountry.length > 0 && (
              <InfoItem
                label="Studios"
                value={movie.originCountry.join('\n')}
              />
            )}
            {movie.originalLanguage && (
              <InfoItem
                label="Language"
                value={movie.originalLanguage.toUpperCase()}
              />
            )}
            {movie.productionCompanies &&
              movie.productionCompanies.length > 0 && (
                <InfoItem
                  label="Studios"
                  value={movie.productionCompanies.join('\n')}
                />
              )}
          </>
        )}

        {/* TV Specific */}
        {tv && (
          <>
            {tv.nextEpisodeToAir && (
              <InfoItem
                label="Next Episode"
                value={`Ep ${tv.nextEpisodeToAir.episodeNumber} season ${tv.nextEpisodeToAir.seasonNumber} airing at ${formatDate(tv.nextEpisodeToAir.airDate)}`}
              />
            )}
            {tv.firstAirDate && (
              <InfoItem
                label="First Air Date"
                value={formatDate(tv.firstAirDate)}
              />
            )}
            {tv.lastAirDate && (
              <InfoItem
                label="Last Air Date"
                value={formatDate(tv.lastAirDate)}
              />
            )}
            {tv.numberOfSeasons && (
              <InfoItem label="Seasons" value={tv.numberOfSeasons} />
            )}
            {tv.numberOfEpisodes && (
              <InfoItem label="Episodes" value={tv.numberOfEpisodes} />
            )}

            {tv.type && <InfoItem label="Type" value={tv.type} />}
            {tv.createdBy && tv.createdBy.length > 0 && (
              <InfoItem label="Created By" value={tv.createdBy.join('\n')} />
            )}
            {tv.networks && tv.networks.length > 0 && (
              <InfoItem
                label="Networks"
                value={tv.networks.join('\n')}
              />
            )}
            {tv.originalLanguage && (
              <InfoItem
                label="Language"
                value={tv.originalLanguage.toUpperCase()}
              />
            )}
            {tv.productionCountries && tv.productionCountries.length > 0 && (
              <InfoItem
                label="Production Countries"
                value={tv.productionCountries.join('\n')}
              />
            )}
            {tv.originalLanguage && (
              <InfoItem
                label="Language"
                value={tv.originalLanguage.toUpperCase()}
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
            {media.synonyms.map((synonym: string, index: number) => (
              <div key={index}>{synonym}</div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
