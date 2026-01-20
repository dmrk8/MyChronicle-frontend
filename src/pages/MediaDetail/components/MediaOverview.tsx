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
import { MediaRecommendations } from './MediaRecommendations';

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
      {/* Anime/Manga: Relations → Characters → Recommendations */}
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
          {anime?.recommendations && anime.recommendations.length > 0 && (
            <MediaRecommendations recommendations={anime.recommendations} />
          )}
          {manga?.recommendations && manga.recommendations.length > 0 && (
            <MediaRecommendations recommendations={manga.recommendations} />
          )}
        </>
      )}

      {/* Movie: Collection → Credits → Recommendations */}
      {mediaType === MediaType.MOVIE && movie && (
        <>
          {movie.belongsToCollection && (
            <MediaCollection collection={movie.belongsToCollection} />
          )}
          {movie.credits && movie.credits.length > 0 && (
            <MediaCredits credits={movie.credits} />
          )}
          {movie.recommendations && movie.recommendations.length > 0 && (
            <MediaRecommendations recommendations={movie.recommendations} />
          )}
        </>
      )}

      {/* TV: Seasons → Credits → Recommendations */}
      {mediaType === MediaType.TV && tv && (
        <>
          {tv.seasons && tv.seasons.length > 0 && (
            <MediaSeasons seasons={tv.seasons} />
          )}
          {tv.credits && tv.credits.length > 0 && (
            <MediaCredits credits={tv.credits} />
          )}
          {tv.recommendations && tv.recommendations.length > 0 && (
            <MediaRecommendations recommendations={tv.recommendations} />
          )}
        </>
      )}
    </div>
  );
};
