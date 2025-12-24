import { useFeaturedMediaAnilist } from '../queries/useFeaturedMediaAnilist';
import MediaGrid from '../components/GridRowMediaDisplay';

const MangaSearch: React.FC = () => {
  const { data, isLoading, isError } = useFeaturedMediaAnilist("MANGA");

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
  const allTimeManhwa = data.allTimeManhwa ?? [];
  const allTime = data.allTime ?? [];

  return (
    <div className="max-w-full mx-80">
      <MediaGrid title="Trending Manga" mediaList={trending} />

      <MediaGrid title="All Time Manga" mediaList={allTime} />

      <MediaGrid title="All Time Manhwa" mediaList={allTimeManhwa} />
    </div>
  );
};

export default MangaSearch;
