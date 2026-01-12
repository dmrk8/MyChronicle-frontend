import { useEffect, useRef, useState } from 'react';
import type { MediaMinimal } from '../types/Media';
import type { MediaType } from '../constants/mediaConstants';

interface SlidingMediaRowProps {
  mediaList: MediaMinimal[];
  onMediaClick: (mediaType: MediaType, id: number) => void;
}

export const SlidingMediaRow = ({
  mediaList,
  onMediaClick,
}: SlidingMediaRowProps) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollSpeed = 0.3;
    let animationFrameId: number;

    const scroll = () => {
      if (scrollContainer && !isPaused) {
        scrollPositionRef.current += scrollSpeed;
        scrollContainer.scrollLeft = scrollPositionRef.current;

        const maxScroll = scrollContainer.scrollWidth / 2;
        if (scrollPositionRef.current >= maxScroll) {
          scrollPositionRef.current = 0;
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPaused]);

  const duplicatedList = [...mediaList, ...mediaList];

  return (
    <div
      className="group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Scrollable Container */}
      <div className="relative overflow-hidden">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-hidden overflow-y-hidden pb-4 px-4 md:px-0"
          style={{ scrollBehavior: 'auto' }}
        >
          {duplicatedList.map((media, index) => (
            <div
              key={`${media.id}-${index}`}
              className="shrink-0 w-37.5 md:w-50 lg:w-60"
              onMouseEnter={() => setHoveredId(media.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                onClick={() =>
                  onMediaClick(media.mediaType as MediaType, media.id)
                }
                className={`relative cursor-pointer transition-all duration-300 ${
                  hoveredId === media.id ? 'scale-110 z-20' : 'scale-100'
                }`}
              >
                {/* Poster */}
                <div className="relative aspect-2/3 rounded-md overflow-hidden bg-zinc-900 shadow-lg">
                  {media.coverImage ? (
                    <img
                      src={media.coverImage}
                      alt={media.title}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <span className="text-4xl">🎬</span>
                    </div>
                  )}

                  {/* Rating Badge */}
                  {media.averageScore && (
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded">
                      <span className="text-green-400 text-xs font-bold">
                        {media.averageScore}/10
                      </span>
                    </div>
                  )}

                  {/* Media Type Badge */}
                  <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded">
                    <span className="text-white text-xs font-bold uppercase">
                      {media.mediaType}
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  {hoveredId === media.id && (
                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent flex items-end p-4">
                      <div className="w-full">
                        <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
                          {media.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {media.episodes && (
                              <span className="text-xs text-zinc-300">
                                {media.episodes} ep
                              </span>
                            )}
                            {media.chapters && (
                              <span className="text-xs text-zinc-300">
                                {media.chapters} ch
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Title (visible on mobile) */}
                <div className="mt-2 md:hidden">
                  <h3 className="text-white text-sm font-medium line-clamp-2">
                    {media.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
