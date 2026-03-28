import { useNavigate } from 'react-router-dom';
import type { MediaRecommendation } from '../../../types/Media';
import { FilmIcon } from '@heroicons/react/24/outline';

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
    <div className="bg-white/4 backdrop-blur-sm border border-white/10 rounded-xl p-4">
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
            <div className="rounded-lg overflow-hidden bg-white/3 border border-white/10 group-hover:border-white/25 transition-all group-hover:scale-105">
              {recommendation.coverImage ? (
                <img
                  src={recommendation.coverImage}
                  alt={recommendation.title}
                  className="w-full aspect-2/3 object-cover"
                />
              ) : (
                <div className="w-full aspect-2/3 bg-zinc-800 flex items-center justify-center">
                  <FilmIcon className="w-6 h-6 text-zinc-600" />
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
