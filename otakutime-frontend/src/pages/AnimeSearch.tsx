import { useFeaturedMediaAnilist } from '../queries/useFeaturedMediaAnilist';
import MediaGrid from '../components/GridRowMediaDisplay';

const AnimeSearch: React.FC = () => {
  const { data, isLoading, isError } = useFeaturedMediaAnilist("ANIME");

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
  
  const trending = data.trending ?? [];
  const popularSeason = data.popularSeason ?? [];
  const upcoming = data.upcoming ?? [];
  const allTime = data.allTime ?? [];

  return (
    <div className="max-w-full mx-80">
      <MediaGrid title="Trending Anime" mediaList={trending} />

      <MediaGrid title="Popular This Season" mediaList={popularSeason} />

      <MediaGrid title="Upcoming Anime" mediaList={upcoming} />

      <MediaGrid title="Popular All Time" mediaList={allTime} />
    </div>
  );
};

export default AnimeSearch;
