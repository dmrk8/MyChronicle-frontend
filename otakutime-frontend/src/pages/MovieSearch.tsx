import React from 'react';
import MediaGrid from '../components/GridRowMediaDisplay';
import {
  useTmdbPopularSeason,
  useTmdbTrendingMedia,
} from '../queries/useTmdbQueries';

const MovieSearch: React.FC = () => {
  const trendingQuery = useTmdbTrendingMedia('movie');
  const popularSeasonQuery = useTmdbPopularSeason('movie');

  const isLoading = trendingQuery.isLoading || popularSeasonQuery.isLoading;
  const isError = trendingQuery.isError || popularSeasonQuery.isError;

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (isError || !trendingQuery.data || !popularSeasonQuery.data) {
    return (
      <div className="text-center text-red-500 py-10">
        {'No data available'}
      </div>
    );
  }

  const trending = (trendingQuery.data.results ?? []).slice(0, 6);
  const popularSeason = (popularSeasonQuery.data.results ?? []).slice(0, 6);

  return (
    <div className="max-w-full mx-80">
      {trending.length > 0 && (
        <MediaGrid title="Trending Movies" mediaList={trending} />
      )}

      {popularSeason.length > 0 && (
        <MediaGrid title="Popular Movies" mediaList={popularSeason} />
      )}
    </div>
  );
};

export default MovieSearch;
