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
    navigate(`/${recommendation.mediaType.toLowerCase()}/${recommendation.id}`);
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Recommendations</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {recommendations.map((recommendation) => (
          <a
            key={recommendation.id}
            href={`/${recommendation.mediaType.toLowerCase()}/${recommendation.id}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavigate(recommendation);
            }}
            className="group flex flex-col gap-1.5"
          >
            {/* Image box */}
            <div className="rounded-lg overflow-hidden bg-zinc-900/50 border border-zinc-700/50 group-hover:border-zinc-500 transition-all group-hover:scale-105">
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
            </div>

            {/* Title below image */}
            <div className="text-[14px] text-zinc-300 font-medium line-clamp-2 group-hover:text-white transition-colors leading-tight px-0.5">
              {recommendation.title}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
