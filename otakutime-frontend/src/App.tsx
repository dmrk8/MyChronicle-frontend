import { Route, Routes } from 'react-router-dom';
import AnimeSearch from './pages/AnimeSearch';
import MangaSearch from './pages/MangaSearch';
import MovieSearch from './pages/MovieSearch';
import TvSearch from './pages/TvSearch';

function App() {
  return (
    <Routes>
      <Route path="/anime/search" element={<AnimeSearch />} />
      <Route path="/manga/search" element={<MangaSearch />} />
      <Route path="/movie/search" element={<MovieSearch />} />
      <Route path="/tv/search" element={<TvSearch />} />
    </Routes>
  );
}

export default App;
