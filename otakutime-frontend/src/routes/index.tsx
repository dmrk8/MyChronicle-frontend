import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import AnimeSearch from '../pages/AnimeSearch';
import MangaSearch from '../pages/MangaSearch';
import MovieSearch from '../pages/MovieSearch';
import TvSearch from '../pages/TvSearch';
import MediaDetailPage from '../pages/MediaDetailPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/anime/search" element={<AnimeSearch />} />
      <Route path="/manga/search" element={<MangaSearch />} />
      <Route path="/movie/search" element={<MovieSearch />} />
      <Route path="/tv/search" element={<TvSearch />} />
      <Route path="/:mediaType/:id" element={<MediaDetailPage />} />


    </Routes>
  );
};
