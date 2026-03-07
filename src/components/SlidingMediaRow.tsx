import { useRef } from 'react';
import { MediaType } from '../constants/mediaConstants';
import type { MediaMinimal } from '../types/Media';

interface SlidingMediaRowProps {
  mediaList: MediaMinimal[];
  onMediaClick: (mediaType: MediaType, id: number) => void;
}

export const SlidingMediaRow = ({
  mediaList,
  onMediaClick,
}: SlidingMediaRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative group/row">
      {/* Left Arrow */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-2 w-10 h-10 flex items-center justify-center bg-black/70 hover:bg-black/90 border border-zinc-700 rounded-full text-white opacity-0 group-hover/row:opacity-100 transition-all duration-200 shadow-xl"
        aria-label="Scroll left"
      >
        ‹
      </button>

      {/* Scrollable Row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {mediaList.map((media) => {
          const href = `/${media.mediaType.toLowerCase()}/${media.id}`;
          return (
            <a
              key={`${media.mediaType}-${media.id}`}
              href={href}
              onClick={(e) => {
                if (e.ctrlKey || e.metaKey || e.button === 1) return;
                e.preventDefault();
                onMediaClick(media.mediaType as MediaType, media.id);
              }}
              draggable={false}
              className="shrink-0 w-36 md:w-44 cursor-pointer group/card no-underline"
            >
              <div className="relative rounded-xl overflow-hidden aspect-2/3 bg-zinc-800">
                <img
                  src={media.coverImage}
                  alt={media.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                  loading="lazy"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-200" />
                <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover/card:translate-y-0 transition-transform duration-200">
                  <p className="text-white text-xs font-medium line-clamp-2">
                    {media.title}
                  </p>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-2 w-10 h-10 flex items-center justify-center bg-black/70 hover:bg-black/90 border border-zinc-700 rounded-full text-white opacity-0 group-hover/row:opacity-100 transition-all duration-200 shadow-xl"
        aria-label="Scroll right"
      >
        ›
      </button>
    </div>
  );
};
