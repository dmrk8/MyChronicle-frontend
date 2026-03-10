import { useState, useRef } from 'react';
import type { MediaRelation } from '../../../types/Media';
import { useNavigate } from 'react-router-dom';
import { formatStatusDisplay } from '../../../constants/anilistFilters';
interface MediaRelationsProps {
  relations: MediaRelation[];
}

const RelationCard = ({ relation }: { relation: MediaRelation }) => (
  <div className="w-64 bg-zinc-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-zinc-700 hover:border-zinc-600 transition-colors">
    <div className="flex gap-2.5 p-2.5">
      <div className="shrink-0 w-20">
        {relation.coverImage ? (
          <img
            src={relation.coverImage}
            alt={relation.title}
            className="w-20 h-28 object-cover rounded"
          />
        ) : (
          <div className="w-20 h-28 bg-zinc-800 flex items-center justify-center rounded">
            <span className="text-zinc-600 text-xl">📺</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div className="text-[10px] text-emerald-400 uppercase font-semibold tracking-wide mb-1 text-left">
          {formatStatusDisplay(relation.relationType)}
        </div>
        <div className="text-xs text-white font-semibold line-clamp-2 flex-1 text-left">
          {relation.title}
        </div>
        <div className="flex gap-2 text-[10px] mt-1 justify-start">
          {relation.format && (
            <div className="text-zinc-400">{relation.format}</div>
          )}
          {relation.format && relation.status && (
            <div className="text-zinc-600">•</div>
          )}
          {relation.status && (
            <div className="text-zinc-500">{relation.status}</div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Info panel that appears beside the image on hover
const RelationInfoPanel = ({ relation }: { relation: MediaRelation }) => (
  <div className="w-60 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded flex flex-col justify-between p-2 h-full">
    <div className="text-[14px] text-emerald-400 font-semibold tracking-wide text-left">
      {formatStatusDisplay(relation.relationType)}
    </div>
    <div className="text-[14px] text-white font-semibold line-clamp-3 text-left mt-1 flex-1">
      {relation.title}
    </div>
    <div className="flex gap-2 text-[14px] mt-1 justify-start">
      {relation.format && (
        <div className="text-zinc-400">{formatStatusDisplay(relation.format)}</div>
      )}
      {relation.format && relation.status && (
        <div className="text-zinc-600">•</div>
      )}
      {relation.status && (
        <div className="text-zinc-500">{formatStatusDisplay(relation.status)}</div>
      )}
    </div>
  </div>
);

export const MediaRelations = ({ relations }: MediaRelationsProps) => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<'left' | 'right'>('right');
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (!relations || relations.length === 0) return null;

  const showFullInfo = relations.length <= 3;

  const handleNavigate = (relation: MediaRelation) => {
    navigate(`/${relation.mediaType}/${relation.id}`);
  };

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);

    if (containerRef.current && itemRefs.current[index]) {
      const container = containerRef.current.getBoundingClientRect();
      const item = itemRefs.current[index]!.getBoundingClientRect();
      const itemCenter = item.left + item.width / 2;
      const containerCenter = container.left + container.width / 2;

      setHoverPosition(itemCenter > containerCenter ? 'left' : 'right');
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Relations</h3>
      <div
        ref={containerRef}
        className={`grid gap-3 ${
          showFullInfo
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10'
        }`}
      >
        {relations.map((relation, index) => (
          <div
            key={index}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className="relative"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <button
              onClick={() => handleNavigate(relation)}
              className={`w-full rounded-lg overflow-hidden transition-colors ${
                showFullInfo
                  ? 'bg-transparent border-none p-0'
                  : 'bg-zinc-900/50 border border-zinc-700/50 hover:border-zinc-600'
              }`}
            >
              {showFullInfo ? (
                <RelationCard relation={relation} />
              ) : (
                <div className="relative">
                  {relation.coverImage ? (
                    <img
                      src={relation.coverImage}
                      alt={relation.title}
                      className="w-full aspect-2/3 object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-2/3 bg-zinc-800 flex items-center justify-center">
                      <span className="text-zinc-600 text-2xl">📺</span>
                    </div>
                  )}

                  {/* Relation type label - hidden on hover */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/40 to-transparent pt-6 pb-2 px-1.5 transition-opacity duration-150 ${
                      hoveredIndex === index ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    <div className="text-[11px] text-white font-semibold tracking-wide text-center truncate drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                      {formatStatusDisplay(relation.relationType)}
                    </div>
                  </div>
                </div>
              )}
            </button>

            {/* Hover info panel - extends from image without shifting it */}
            {hoveredIndex === index && !showFullInfo && (
              <div
                className={`absolute top-0 bottom-0 z-50 pointer-events-none flex ${
                  hoverPosition === 'left'
                    ? 'right-full pr-0.5'
                    : 'left-full pl-0.5'
                }`}
              >
                <div className="w-36 h-full">
                  <RelationInfoPanel relation={relation} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
