import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import LoginPage from '../pages/Login';
import SignUpPage from '../pages/SignUp';
import SearchMedia from '../pages/SearchMedia/SearchMedia';
import MediaDetailPage from '../pages/MediaDetail/MediaDetail';
import ProfilePage from '../pages/Profile';
import HomePage from '../pages/Home';
import LibraryPage from '../pages/Library';
import NotFound from '../pages/NotFound';
import ScrollToTop from './components/ScrollToTop';

export const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />

        {/* Unified media search route */}
        <Route path="/:mediaType/search" element={<SearchMedia />} />
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

        {/* Catch all unmatched routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};
