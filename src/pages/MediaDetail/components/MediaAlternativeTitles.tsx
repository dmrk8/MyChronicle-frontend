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
    <div className="bg-white/4 backdrop-blur-sm border border-white/10 rounded-xl p-4 mt-5">
      <h3 className="text-sm font-semibold mb-2 text-zinc-500">
        Alternative Titles
      </h3>
      <div className="space-y-1.5">
        {media.synonyms.map((synonym: string, index: number) => (
          <div key={index} className="text-xs text-zinc-300 leading-relaxed">
            {synonym}
          </div>
        ))}
      </div>
    </div>
  );
};
