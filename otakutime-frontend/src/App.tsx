import { Route, Routes } from 'react-router-dom';
import FeatureAnime from './pages/FeaturedMedia';

function App() {
  return (
    <Routes>
      <Route path="/featured" element={<FeatureAnime />} />
    </Routes>
  );
}

export default App;
