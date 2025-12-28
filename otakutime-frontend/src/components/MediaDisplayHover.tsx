import type { ReactNode } from 'react';
import type { MediaMinimal } from '../types/MediaInterface';

type Placement = 'right' | 'left';

interface MediaDisplayHoverProps {
  media: MediaMinimal;
  children: ReactNode;
  placement?: Placement;
}

const formatScore = (score?: number) => {
  if (score === undefined || score === null) return null;
  return `${score}`;
};

const joinGenres = (genres?: string[]) => {
  if (!genres || genres.length === 0) return null;
  return genres.slice(0, 5).join(', ');
};

const getScoreColor = (score?: number) => {
  if (!score) return 'text-zinc-400';
  if (score >= 80) return 'text-green-400';
  if (score >= 70) return 'text-blue-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-orange-400';
};

const MediaDisplayHover = ({
  media,
  children,
  placement = 'right',
}: MediaDisplayHoverProps) => {
  const mediaType = (media.mediaType || '').toLowerCase();
  const isManga = mediaType.includes('manga');

  const infoRows: Array<{
    label: string;
    value: string | null;
    highlight?: boolean;
  }> = [
    { label: 'Format', value: media.format || null },
    { label: 'Genres', value: joinGenres(media.genres) },
    { label: 'Studio', value: media.mainStudio || null },
    {
      label: isManga ? 'Chapters' : 'Episodes',
      value: isManga
        ? media.chapters?.toString() || null
        : media.episodes?.toString() || null,
    },
    { label: 'Score', value: formatScore(media.averageScore), highlight: true },
  ].filter((row) => row.value !== null); // Only keep rows with valid values

  const placementClasses =
    placement === 'left'
      ? 'right-full mr-4 origin-right'
      : 'left-full ml-4 origin-left';

  // Don't show hover card if there's no useful info
  if (infoRows.length === 0 && !media.status) {
    return <>{children}</>;
  }

  return (
    <div className="relative inline-block group">
      {children}

      {/* Hover card */}
      <div
        className={[
          'pointer-events-none absolute top-0',
          placementClasses,
          'z-30 w-72 rounded-lg border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800/95',
          'backdrop-blur-sm shadow-2xl',
          'opacity-0 translate-y-2 scale-95',
          'group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100',
          'transition-all duration-200 ease-out',
        ].join(' ')}
      >
        {/* Header with gradient overlay */}
        <div className="relative mb-3 p-4 pb-3 border-b border-zinc-700/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-lg">
          <div className="text-base font-bold text-zinc-50 line-clamp-2 mb-1">
            {media.title}
          </div>
          <div className="flex items-center gap-2">
            {media.status && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                {media.status}
              </span>
            )}
            {media.averageScore && (
              <span
                className={`text-xs font-semibold ${getScoreColor(
                  media.averageScore
                )}`}
              >
                ★ {media.averageScore}
              </span>
            )}
          </div>
        </div>

        {/* Info rows - only shown if there are any */}
        {infoRows.length > 0 && (
          <div className="space-y-2.5 px-4 pb-4">
            {infoRows.map((row) => (
              <div key={row.label} className="flex gap-3 text-xs">
                <div className="w-20 shrink-0 font-medium text-zinc-400">
                  {row.label}
                </div>
                <div
                  className={`min-w-0 flex-1 line-clamp-2 ${
                    row.highlight && media.averageScore
                      ? `font-semibold ${getScoreColor(media.averageScore)}`
                      : 'text-zinc-200'
                  }`}
                >
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-tr-lg pointer-events-none" />
      </div>
    </div>
  );
};

export default MediaDisplayHover;
