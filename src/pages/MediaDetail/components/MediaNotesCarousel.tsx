import { useState } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaCircle,
  FaPlus,
} from 'react-icons/fa';
import { MediaNotes } from './MediaNotes';
import type { ReviewUpdate } from '../../../types/Review';
import {
  useCreateReview,
  useDeleteReview,
  useGetReviewsByUserMediaEntryId,
  useUpdateReview,
} from '../../../hooks/useReview';

interface MediaNotesCarouselProps {
  mediaTitle: string;
  userMediaEntryId?: string;
}

export const MediaNotesCarousel = ({
  mediaTitle,
  userMediaEntryId,
}: MediaNotesCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: mediaNotes } = useGetReviewsByUserMediaEntryId(
    userMediaEntryId || '',
  );
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const hasReviews = mediaNotes && mediaNotes.length > 0;
  const totalSlots = hasReviews ? mediaNotes.length + 1 : 1; // Reviews + new slot
  const isOnNewReviewSlot = hasReviews && currentIndex === mediaNotes.length;

  const handleSaveNotes = async (
    reviewId: string | undefined,
    update: ReviewUpdate,
  ) => {
    if (!userMediaEntryId) return;

    try {
      if (reviewId) {
        await updateReview.mutateAsync({
          reviewId,
          update,
        });
      } else {
        await createReview.mutateAsync({
          userMediaEntryId: userMediaEntryId,
          ...update,
        });
      }
    } catch (error) {
      console.error('Failed to save review:', error);
    }
  };

  const handleDeleteNotes = async (reviewId: string) => {
    if (!userMediaEntryId) return;

    try {
      await deleteReview.mutateAsync({
        reviewId,
        userMediaEntryId: userMediaEntryId,
      });
    } catch (error) {
      console.error('Failed to delete review:', error);
    }

    try {
      await deleteReview.mutateAsync({
        reviewId,
        userMediaEntryId: userMediaEntryId,
      });
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : totalSlots - 1;
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < totalSlots - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleSaveNew = async (
    reviewId: string | undefined,
    update: ReviewUpdate,
  ) => {
    await handleSaveNotes(reviewId, update);
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
            onSave={hasReviews ? handleSaveNew : handleSaveNotes}
            showDelete={false}
          />
        ) : (
          <MediaNotes
            key={currentNote?.id || currentIndex}
            review={currentNote}
            onSave={handleSaveNotes}
            mediaTitle={mediaTitle}
            onDelete={handleDeleteNotes}
            showDelete={true}
          />
        )}
      </div>
    </div>
  );
};
