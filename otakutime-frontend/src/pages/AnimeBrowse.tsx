import type { AnilistMediaMinimal } from '../types/AnilistInterface';
import { useFeaturedAnime } from '../queries/useFeaturedAnime';
import MediaGrid from '../components/GridRowMediaDisplay';

const FeatureAnime: React.FC = () => {
  const { data, isLoading, isError } = useFeaturedAnime();

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (isError || !data) {
    return (
      <div className="text-center text-red-500 py-10">
        {'No data available'}
      </div>
    );
  }

  const renderAnimeGrid = (animeList: AnilistMediaMinimal[], title: string) => (
    <div className="mb-15">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-10">
        {animeList.map((anime) => (
          <div
            key={anime.id}
            className="flex flex-col justify-center aspect-2/3"
          >
            <img
              src={anime.coverImage?.large}
              alt={anime.title?.english ?? anime.title?.romaji ?? 'Anime'}
              className="w-full h-full rounded-md"
              loading="lazy"
            />
            <div className="mt-2 text-xs text-center font-medium  line-clamp-2 ">
              {anime.title?.english ?? anime.title?.romaji ?? 'Anime'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-full mx-80">
      <MediaGrid title="Trending Anime" mediaList={data.trending} />

      <MediaGrid title="Popular This Season" mediaList={data.popularSeason} />

      <MediaGrid title="Upcoming Anime" mediaList={data.upcoming} />

      <MediaGrid title="Popular All Time" mediaList={data.allTime} />
    </div>
  );
};

export default FeatureAnime;
