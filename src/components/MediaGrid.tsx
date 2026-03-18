import type { MediaMinimal } from '../types/Media';
import MediaCard from './MediaCard';

interface MediaGridProps {
  title: string;
  mediaList: MediaMinimal[];
  onMediaClick: (id: number) => void;
  isLoading?: boolean;
  skeletonCount?: number;
}

const SkeletonCard = ({ index = 0 }: { index?: number }) => (
  <div
    className="flex flex-col animate-pulse"
    style={{ animationDelay: `${index * 60}ms` }}
  >
    {/* Image skeleton */}
    <div className="w-full aspect-2/3 bg-zinc-800 rounded-lg mb-3" />
    {/* Title skeleton */}
    <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
    {/* Subtitle skeleton */}
    <div className="h-3 bg-zinc-800 rounded w-1/2" />
  </div>
);

const MediaGrid = ({
  title,
  mediaList,
  onMediaClick,
  isLoading = false,
  skeletonCount = 6,
}: MediaGridProps) => {
  const showSkeletons = isLoading && mediaList.length === 0;

  if (mediaList.length === 0 && !showSkeletons) return null;


  const cols = 6;
  const remainder = mediaList.length % cols;
  const fillCount = remainder === 0 ? cols : cols - remainder;

  return (
    <section className="mb-12">
      {title && (
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
            <div className="flex-1 h-px bg-linear-to-r from-zinc-700 to-transparent" />
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {showSkeletons
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} index={i} />
            ))
          : mediaList.map((media) => (
              <MediaCard
                key={media.id}
                media={media}
                onClick={() => onMediaClick(media.id)}
                href={`/${media.mediaType}/${media.id}`}
              />
            ))}

        {!showSkeletons && isLoading &&
          Array.from({ length: fillCount }).map((_, i) => (
            <SkeletonCard key={`fill-skeleton-${i}`} index={i} />
          ))}
      </div>
    </section>
  );
};

export default MediaGrid