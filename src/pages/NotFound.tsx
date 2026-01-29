import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-900 via-black to-zinc-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-6 opacity-50">🔍</div>
        <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-zinc-400 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
