import { Route, Routes } from 'react-router-dom';
import AnimeSearch from './pages/AnimeSearch';
import MangaSearch from './pages/MangaSearch';

function App() {
  return (
    <Routes>
      <Route path="/anime/search" element={<AnimeSearch />} />
      <Route path="/manga/search" element={<MangaSearch />} />
    </Routes>
  );
}

export default App;
