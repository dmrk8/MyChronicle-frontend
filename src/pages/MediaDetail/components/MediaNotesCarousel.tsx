import { useState } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaCircle,
  FaPlus,
} from 'react-icons/fa';
import { MediaNotes } from './MediaNotes';
import type { Review, ReviewUpdate } from '../../../types/Review';

interface MediaNotesCarouselProps {
  mediaTitle: string;
  mediaNotes: Review[];
  onSave: (reviewId: string | undefined, update: ReviewUpdate) => Promise<void>;
  onDelete: (reviewId: string) => Promise<void>;
  onNavigate?: (currentIndex: number) => void;
}

export const MediaNotesCarousel = ({
  mediaNotes,
  mediaTitle,
  onSave,
  onDelete,
  onNavigate,
}: MediaNotesCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasReviews = mediaNotes && mediaNotes.length > 0;
  const totalSlots = hasReviews ? mediaNotes.length + 1 : 1; // Reviews + new slot
  const isOnNewReviewSlot = hasReviews && currentIndex === mediaNotes.length;

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : totalSlots - 1;
    setCurrentIndex(newIndex);
    onNavigate?.(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < totalSlots - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    onNavigate?.(newIndex);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    onNavigate?.(index);
  };

  const handleSaveNew = async (
    reviewId: string | undefined,
    update: ReviewUpdate
  ) => {
    await onSave(reviewId, update);
    // After saving, navigate to the first review
    setCurrentIndex(0);
  };

  const currentNote =
    hasReviews && !isOnNewReviewSlot ? mediaNotes[currentIndex] : undefined;

  return (
    <div className="space-y-4">
      {/* Navigation Header */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-400">
            {hasReviews
              ? isOnNewReviewSlot
                ? `New Review`
                : `Review ${currentIndex + 1} of ${mediaNotes.length}`
              : 'New Review'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Dot Indicators */}
          {hasReviews && totalSlots <= 11 && (
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSlots }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`transition-all duration-200 ${
                    index === currentIndex
                      ? 'text-blue-400 scale-125'
                      : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                  aria-label={
                    index === mediaNotes.length
                      ? 'New review'
                      : `Go to review ${index + 1}`
                  }
                >
                  {index === mediaNotes.length ? (
                    <FaPlus size={8} />
                  ) : (
                    <FaCircle size={8} />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Arrow Navigation */}
          {hasReviews && (
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
          )}
        </div>
      </div>

      {/* Current Review or New Review Form */}
      <div className="relative">
        {isOnNewReviewSlot || !hasReviews ? (
          <MediaNotes
            key="new-review"
            mediaTitle={mediaTitle}
            onSave={hasReviews ? handleSaveNew : onSave}
            showDelete={false}
          />
        ) : (
          <MediaNotes
            key={currentNote?.id || currentIndex}
            review={currentNote}
            onSave={onSave}
            mediaTitle={mediaTitle}
            onDelete={onDelete}
            showDelete={true}
          />
        )}
      </div>
      
    </div>
  );
};
