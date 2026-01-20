import { useNavigate } from 'react-router-dom';
import type { MediaRecommendation } from '../../../types/Media';

interface MediaRecommendationsProps {
  recommendations: MediaRecommendation[];
}

export const MediaRecommendations = ({
  recommendations,
}: MediaRecommendationsProps) => {
  const navigate = useNavigate();

  if (!recommendations || recommendations.length === 0) return null;

  const handleNavigate = (recommendation: MediaRecommendation) => {
    navigate(`/${recommendation.mediaType}/${recommendation.id}`);
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Recommendations</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {recommendations.map((recommendation) => (
          <button
            key={recommendation.id}
            onClick={() => handleNavigate(recommendation)}
            className="group relative rounded-lg overflow-hidden bg-zinc-900/50 border border-zinc-700/50 hover:border-zinc-600 transition-all hover:scale-105"
          >
            {recommendation.coverImage ? (
              <img
                src={recommendation.coverImage}
                alt={recommendation.title}
                className="w-full aspect-2/3 object-cover"
              />
            ) : (
              <div className="w-full aspect-2/3 bg-zinc-800 flex items-center justify-center">
                <span className="text-zinc-600 text-2xl">📺</span>
              </div>
            )}

            {/* Title overlay on hover */}
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <div className="text-xs text-white font-semibold line-clamp-3">
                {recommendation.title}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
