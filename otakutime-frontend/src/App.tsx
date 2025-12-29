import { Route, Routes } from 'react-router-dom';
import AnimeSearch from './pages/AnimeSearch';
import MangaSearch from './pages/MangaSearch';
import MovieSearch from './pages/MovieSearch';
import TvSearch from './pages/TvSearch';
import MediaDetailPage from './pages/MediaDetailPage';

function App() {
  return (
    <Routes>
      <Route path="/anime/search" element={<AnimeSearch />} />
      <Route path="/manga/search" element={<MangaSearch />} />
      <Route path="/movie/search" element={<MovieSearch />} />
      <Route path="/tv/search" element={<TvSearch />} />
      <Route path="/:mediaType/:id" element={<MediaDetailPage />} />
    </Routes>
  );
}

export default App;
