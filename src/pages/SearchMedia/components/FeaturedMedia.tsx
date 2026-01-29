import { useNavigate } from 'react-router-dom';
import MediaGrid from '../../../components/MediaGrid';
import { MediaType } from '../../../constants/mediaConstants';
import { useFeaturedMedia } from '../../../hooks/useMedia';

const FeaturedMedia = ({ mediaType }: { mediaType: MediaType }) => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useFeaturedMedia(mediaType);

  const trending = data?.trending ?? [];
  const popularSeason = data?.popularSeason ?? [];
  const upcoming = data?.upcoming ?? [];
  const allTime = data?.allTime ?? [];
  const popularManhwa = data?.allTimeManhwa ?? [];

  const openDetails = (id: number) =>
    navigate(`/${mediaType.toLowerCase()}/${id}`);

  const trendingTitle = `Trending ${
    mediaType.charAt(0).toUpperCase() + mediaType.slice(1)
  }`;
  const popularSeasonTitle = 'Popular This Season';
  const upcomingTitle = `Upcoming ${
    mediaType.charAt(0).toUpperCase() + mediaType.slice(1)
  }`;
  const allTimeTitle = 'Popular All Time';
  const popularManhwaTitle = 'Popular Manhwas';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full" />
          <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-zinc-400 text-lg">Loading amazing content...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="text-6xl mb-4">❌</div>
        <p className="text-xl font-medium text-red-400 mb-2">
          Oops! Something went wrong
        </p>
        <p className="text-zinc-500">
          Unable to load content. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {trending.length > 0 && (
        <MediaGrid
          title={trendingTitle}
          mediaList={trending}
          onMediaClick={openDetails}
        />
      )}
      {popularSeason.length > 0 && (
        <MediaGrid
          title={popularSeasonTitle}
          mediaList={popularSeason}
          onMediaClick={openDetails}
        />
      )}
      {upcoming.length > 0 && (
        <MediaGrid
          title={upcomingTitle}
          mediaList={upcoming}
          onMediaClick={openDetails}
        />
      )}
      {allTime.length > 0 && (
        <MediaGrid
          title={allTimeTitle}
          mediaList={allTime}
          onMediaClick={openDetails}
        />
      )}
      {popularManhwa.length > 0 && (
        <MediaGrid
          title={popularManhwaTitle}
          mediaList={popularManhwa}
          onMediaClick={openDetails}
        />
      )}
    </div>
  );
};

export default FeaturedMedia;
