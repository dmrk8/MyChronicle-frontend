import type {
  AnimeDetailed,
  MangaDetailed,
  MovieDetailed,
  TVDetailed,
} from '../../../types/Media';
import { MediaType } from '../../../constants/mediaConstants';
import { MediaRelations } from './MediaRelations';
import { MediaCharacters } from './MediaCharacters';
import { MediaCredits } from './MediaCredits';
import { MediaSeasons } from './MediaSeasons';
import { MediaCollection } from './MediaCollection';

interface MediaOverviewProps {
  anime?: AnimeDetailed;
  manga?: MangaDetailed;
  movie?: MovieDetailed;
  tv?: TVDetailed;
  mediaType: MediaType;
}

export const MediaOverview = ({
  anime,
  manga,
  movie,
  tv,
  mediaType,
}: MediaOverviewProps) => {
  const media = anime || manga || movie || tv;
  if (!media) return null;

  return (
    <div className="space-y-6">
      {/* Anime/Manga: Relations → Characters */}
      {(mediaType === MediaType.ANIME || mediaType === MediaType.MANGA) && (
        <>
          {anime?.relations && anime.relations.length > 0 && (
            <MediaRelations relations={anime.relations} />
          )}
          {manga?.relations && manga.relations.length > 0 && (
            <MediaRelations relations={manga.relations} />
          )}
          {anime?.characters && anime.characters.length > 0 && (
            <MediaCharacters characters={anime.characters} />
          )}
          {manga?.characters && manga.characters.length > 0 && (
            <MediaCharacters characters={manga.characters} />
          )}
        </>
      )}

      {/* Movie: Collection → Credits */}
      {mediaType === MediaType.MOVIE && movie && (
        <>
          {movie.belongsToCollection && (
            <MediaCollection collection={movie.belongsToCollection} />
          )}
          {movie.credits && movie.credits.length > 0 && (
            <MediaCredits credits={movie.credits} />
          )}
        </>
      )}

      {/* TV: Seasons → Credits */}
      {mediaType === MediaType.TV && tv && (
        <>
          {tv.seasons && tv.seasons.length > 0 && (
            <MediaSeasons seasons={tv.seasons} />
          )}
          {tv.credits && tv.credits.length > 0 && (
            <MediaCredits credits={tv.credits} />
          )}
        </>
      )}
    </div>
  );
};
