import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import LoginPage from '../pages/Login';
import SignUpPage from '../pages/SignUp';
import AnimeSearch from '../pages/AnimeSearch';
import MangaSearch from '../pages/MangaSearch';
import MovieSearch from '../pages/MovieSearch';
import TvSearch from '../pages/TvSearch';
import MediaDetailPage from '../pages/MediaDetail';
import ProfilePage from '../pages/Profile';
import HomePage from '../pages/Home';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      <Route path="home" element={<HomePage />} />

      {/* Media search routes */}
      <Route path="/anime/search" element={<AnimeSearch />} />
      <Route path="/manga/search" element={<MangaSearch />} />
      <Route path="/movie/search" element={<MovieSearch />} />
      <Route path="/tv/search" element={<TvSearch />} />
      <Route path="/:mediaType/:id" element={<MediaDetailPage />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
};
