import type { MediaMinimal } from '../types/MediaInterface';
import MediaDisplayHover from './MediaDisplayHover';

interface MediaGridProps {
  title: string;
  mediaList: MediaMinimal[];
  onMediaClick: (id: number) => void;
}

const MediaGrid = ({ mediaList, title, onMediaClick }: MediaGridProps) => {
  return (
    <section className="mb-15">
      <h2 className="text-xl font-semibold mb-3 text-left">{title}</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-10">
        {mediaList.map((media: MediaMinimal, index: number) => {
          // Determine placement based on column position
          // Show on left for last 2 columns to prevent overflow
          const isLastColumns = index % 6 >= 4;
          const placement = isLastColumns ? 'left' : 'right';

          return (
            <MediaDisplayHover
              key={media.id}
              media={media}
              placement={placement}
            >
              <button
                type="button"
                onClick={() => onMediaClick(media.id)}
                className="flex flex-col text-left w-full"
              >
                {/* Image wrapper locks size */}
                <div className="w-full aspect-2/3">
                  <img
                    src={media.coverImage ?? ''}
                    alt={media.title}
                    className="w-full h-full rounded-md"
                    loading="lazy"
                  />
                </div>

                {/* Reserved title space */}
                <div
                  className="mt-2 text-sm text-left font-medium line-clamp-2"
                  title={media.title}
                >
                  {media.title}
                </div>
              </button>
            </MediaDisplayHover>
          );
        })}
      </div>
    </section>
  );
};

export default MediaGrid;
