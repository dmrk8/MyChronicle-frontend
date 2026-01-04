import { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaCircle } from 'react-icons/fa';
import { MediaNotes } from './MediaNotes';
import type { Review, ReviewUpdate } from '../../../types/Review';

interface MediaNotesCarouselProps {
  mediaTitle: string;
  mediaNotes: Review[];
  onSave: (reviewId: string | undefined, update: ReviewUpdate) => Promise<void>;
  onNavigate?: (currentIndex: number) => void;
}

export const MediaNotesCarousel = ({
  mediaNotes,
  mediaTitle,
  onSave,
  onNavigate,
}: MediaNotesCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!mediaNotes || mediaNotes.length === 0) {
    return <MediaNotes onSave={onSave} mediaTitle={mediaTitle} />;
  }

  const currentNote = mediaNotes[currentIndex];
  const hasMultipleNotes = mediaNotes.length > 1;

  const handlePrevious = () => {
    const newIndex =
      currentIndex > 0 ? currentIndex - 1 : mediaNotes.length - 1;
    setCurrentIndex(newIndex);
    onNavigate?.(newIndex);
  };

  const handleNext = () => {
    const newIndex =
      currentIndex < mediaNotes.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    onNavigate?.(newIndex);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    onNavigate?.(index);
  };

  return (
    <div className="space-y-4">
      {/* Navigation Header */}
      {hasMultipleNotes && (
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-400">
              Review {currentIndex + 1} of {mediaNotes.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Dot Indicators */}
            {mediaNotes.length <= 10 && (
              <div className="flex items-center gap-2">
                {mediaNotes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`transition-all duration-200 ${
                      index === currentIndex
                        ? 'text-blue-400 scale-125'
                        : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                    aria-label={`Go to review ${index + 1}`}
                  >
                    <FaCircle size={8} />
                  </button>
                ))}
              </div>
            )}

            {/* Arrow Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                className="p-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                aria-label="Previous review"
              >
                <FaChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="p-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                aria-label="Next review"
              >
                <FaChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Review */}
      <div className="relative">
        <MediaNotes
          review={currentNote}
          onSave={onSave}
          mediaTitle={mediaTitle}
        />

      </div>

      {/* Keyboard Navigation Hint */}
      {hasMultipleNotes && (
        <div className="text-center text-xs text-zinc-600 mt-2">
          Use ← → arrow keys or swipe to navigate between reviews
        </div>
      )}
    </div>
  );
};
