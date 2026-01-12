import type { MediaMinimal } from '../types/Media';
import MediaCard from './MediaCard';

interface MediaGridProps {
  title: string;
  mediaList: MediaMinimal[];
  onMediaClick: (id: number) => void;
}

const MediaGrid = ({ title, mediaList, onMediaClick }: MediaGridProps) => {
  if (mediaList.length === 0) return null;

  return (
    <section className="mb-12">
      {/* Section Header */}
      {title && (
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {title}
            </h2>
            <div className="flex-1 h-px bg-linear-to-r from-zinc-700 to-transparent" />
          </div>
        </div>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {mediaList.map((media) => (
          <MediaCard
            key={media.id}
            media={media}
            onClick={() => onMediaClick(media.id)}
          />
        ))}
      </div>
    </section>
  );
};


export default MediaGrid;
