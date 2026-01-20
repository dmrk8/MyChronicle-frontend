import { useState } from 'react';
import type { MediaRelation } from '../../../types/Media';
import { useNavigate } from 'react-router-dom';

interface MediaRelationsProps {
  relations: MediaRelation[];
}

export const MediaRelations = ({ relations }: MediaRelationsProps) => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!relations || relations.length === 0) return null;

  const showFullInfo = relations.length <= 3;

  const handleNavigate = (relation: MediaRelation) => {
    navigate(`/${relation.format}/${relation.id}`);
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Relations</h3>
      <div
        className={`grid gap-3 ${
          showFullInfo
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10'
        }`}
      >
        {relations.map((relation, index) => (
          <div
            key={index}
            className="relative"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <button
              onClick={() => handleNavigate(relation)}
              className={`w-full bg-zinc-900/50 rounded-lg overflow-hidden transition-all border border-zinc-700/50 hover:border-zinc-600 ${
                showFullInfo ? 'p-3' : ''
              } ${hoveredIndex === index && !showFullInfo ? 'scale-110 z-10 shadow-2xl' : ''}`}
            >
              {showFullInfo ? (
                // Full info layout for 3 or fewer relations
                <div className="flex flex-col h-full">
                  {relation.coverImage && (
                    <img
                      src={relation.coverImage}
                      alt={relation.title}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <div className="text-xs text-zinc-400 mb-1 uppercase font-medium">
                    {relation.relationType}
                  </div>
                  <div className="text-sm text-white font-medium line-clamp-2 flex-1">
                    {relation.title}
                  </div>
                  {relation.format && (
                    <div className="text-xs text-zinc-500 mt-1">
                      {relation.format}
                    </div>
                  )}
                  {relation.status && (
                    <div className="text-xs text-zinc-500 mt-1">
                      {relation.status}
                    </div>
                  )}
                </div>
              ) : (
                // Compact layout
                <div className="relative group">
                  {relation.coverImage ? (
                    <img
                      src={relation.coverImage}
                      alt={relation.title}
                      className="w-full aspect-[2/3] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-zinc-800 flex items-center justify-center">
                      <span className="text-zinc-600 text-2xl">📺</span>
                    </div>
                  )}

                  {/* Always visible relation type */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1.5">
                    <div className="text-[10px] text-zinc-300 uppercase font-medium text-center truncate">
                      {relation.relationType}
                    </div>
                  </div>
                </div>
              )}
            </button>

            {/* Hover overlay - expanded card outside the button */}
            {hoveredIndex === index && !showFullInfo && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 bg-zinc-900 rounded-lg shadow-2xl border-2 border-zinc-600 z-50 pointer-events-none">
                <div className="p-4 space-y-3">
                  {relation.coverImage && (
                    <img
                      src={relation.coverImage}
                      alt={relation.title}
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="text-xs text-emerald-400 uppercase font-semibold tracking-wide mb-1">
                      {relation.relationType}
                    </div>
                    <div className="text-sm text-white font-semibold line-clamp-2 mb-2">
                      {relation.title}
                    </div>
                    {relation.format && (
                      <div className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                        <span>📺</span> {relation.format}
                      </div>
                    )}
                    {relation.status && (
                      <div className="text-xs text-zinc-400 font-medium flex items-center gap-1 mt-1">
                        <span>⏺️</span> {relation.status}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
