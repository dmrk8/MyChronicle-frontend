import type {
  AnimeDetailed,
  MangaDetailed,
  MovieDetailed,
  TVDetailed,
} from '../../../types/Media';

interface MediaAlternativeTitlesProps {
  anime?: AnimeDetailed;
  manga?: MangaDetailed;
  movie?: MovieDetailed;
  tv?: TVDetailed;
}

export const MediaAlternativeTitles = ({
  anime,
  manga,
  movie,
  tv,
}: MediaAlternativeTitlesProps) => {
  const media = anime || manga || movie || tv;
  if (!media) return null;

  if (!media.synonyms || media.synonyms.length === 0) return null;

  return (
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
  );
};
