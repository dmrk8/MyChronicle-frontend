import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import LoginPage from '../pages/Login';
import SignUpPage from '../pages/SignUp';
import AnimeSearch from '../pages/SearchMedia/AnimeSearch';
import MangaSearch from '../pages/SearchMedia/MangaSearch';
import TvSearch from '../pages/SearchMedia/TvSearch';
import MovieSearch from '../pages/SearchMedia/MovieSearch';
import MediaDetailPage from '../pages/MediaDetail/MediaDetail';
import ProfilePage from '../pages/Profile';
import HomePage from '../pages/Home';
import LibraryPage from '../pages/Library';

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
        path="/library"
        element={
          <ProtectedRoute>
            <LibraryPage />
          </ProtectedRoute>
        }
      />

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
