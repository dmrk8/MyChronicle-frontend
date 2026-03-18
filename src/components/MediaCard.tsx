import { useState } from 'react';
import type { MediaMinimal } from '../types/Media';

interface MediaCardProps {
  media: MediaMinimal;
  onClick: () => void;
  href?: string;
}

const MediaCard = ({ media, onClick, href }: MediaCardProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Only prevent default and call onClick for left clicks
    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <a
      href={href || '#'}
      onClick={handleClick}
      onContextMenu={(e) => {
        // Allow context menu by not preventing default
        e.stopPropagation();
      }}
      className="group cursor-pointer h-full block"
    >
      {/* Card Container */}
      <div className="relative h-full flex flex-col bg-zinc-900/80 rounded-xl overflow-hidden border border-zinc-800 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
        {/* Image Container */}
        <div className="relative aspect-2/3 overflow-hidden bg-zinc-800 shrink-0">
          {media.coverImage ? (
            <>
              <div
                className={`absolute inset-0 bg-zinc-800 transition-opacity duration-500 ${imgLoaded ? 'opacity-0' : 'opacity-100'}`}
              />
              <img
                src={media.coverImage}
                alt={media.title}
                onLoad={() => setImgLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="eager"
                decoding="async"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              <span className="text-4xl">🎬</span>
            </div>
          )}

          {/* Rating Badge */}
          {media.averageScore && (
            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-zinc-700">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-sm">⭐</span>
                <span className="text-white text-xs font-semibold">
                  {media.averageScore}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-3 flex-1 flex flex-col">
          {/* Title */}
          <h3
            className="text-white font-semibold text-sm line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors min-h-10"
            title={media.title}
          >
            {media.title}
          </h3>
        </div>

        {/* Hover Border Glow Effect */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-blue-500/20 to-purple-500/20" />
        </div>
      </div>
    </a>
  );
};

export default MediaCard;
