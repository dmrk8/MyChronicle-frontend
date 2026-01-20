import type {
  AnimeDetailed,
  MangaDetailed,
  MovieDetailed,
  TVDetailed,
} from '../../../types/Media';

type MediaDetailed = AnimeDetailed | MangaDetailed | MovieDetailed | TVDetailed;

interface MainMediaInfoProps {
  media: MediaDetailed;
}

const getScoreColor = (score?: number | null) => {
  if (!score) return 'text-zinc-400';
  if (score >= 80) return 'text-green-400';
  if (score >= 70) return 'text-blue-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-orange-400';
};

export const MainMediaInfo = ({ media }: MainMediaInfoProps) => {
  return (
    <div className="flex-1">
      {/* Title and Score */}
      <div className="mb-6 mt-10">
        <h1 className="text-4xl font-bold mb-2">{media.title}</h1>
        {media.averageScore && (
          <div className="flex items-center gap-2">
            <span
              className={`text-2xl font-bold ${getScoreColor(
                media.averageScore,
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
            {media.mediaType === 'MANGA' &&
              'countryOfOrigin' in media &&
              media.countryOfOrigin && <> ({media.countryOfOrigin})</>}
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
            {media.genres.map((genre: string) => (
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
  );
};
