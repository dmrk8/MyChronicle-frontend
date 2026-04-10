import { useState, useEffect } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaCircle,
  FaPlus,
  FaRedo,
} from 'react-icons/fa';
import { MediaNotes } from './MediaNotes';
import type { ReviewUpdate } from '../../../types/Review';
import {
  useCreateReview,
  useDeleteReview,
  useGetReviewsForEntry,
  useUpdateReview,
} from '../../../hooks/useUserMediaEntry';
import { useUpdateUserMediaEntry } from '../../../hooks/useUserMediaEntry';

interface MediaNotesCarouselProps {
  mediaTitle: string;
  userMediaEntryId?: string;
  repeatCount?: number;
}

export const MediaNotesCarousel = ({
  mediaTitle,
  userMediaEntryId,
  repeatCount = 0,
}: MediaNotesCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [repeatInput, setRepeatInput] = useState(String(repeatCount));

  const { data: mediaNotes } = useGetReviewsForEntry(userMediaEntryId || '');
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();
  const updateEntry = useUpdateUserMediaEntry();

  const hasReviews = mediaNotes && mediaNotes.length > 0;
  const totalSlots = hasReviews ? mediaNotes.length + 1 : 1;
  const isOnNewReviewSlot = hasReviews && currentIndex === mediaNotes.length;

  useEffect(() => {
    setRepeatInput(String(repeatCount));
  }, [repeatCount]);

  const handleRepeatSave = async () => {
    if (!userMediaEntryId) return;
    const parsed = parseInt(repeatInput, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      await updateEntry.mutateAsync({
        entryId: userMediaEntryId,
        update: { repeatCount: parsed },
      });
    } else {
      setRepeatInput(String(repeatCount));
    }
  };

  const handleSaveNotes = async (
    reviewId: string | undefined,
    update: ReviewUpdate,
  ) => {
    if (!userMediaEntryId) return;

    try {
      if (reviewId) {
        await updateReview.mutateAsync({
          entryId: userMediaEntryId,
          reviewId,
          update,
        });
      } else {
        await createReview.mutateAsync({
          entryId: userMediaEntryId,
          review: update,
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
        entryId: userMediaEntryId,
        reviewId,
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
      {/* Repeat Count */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/60 rounded-lg border border-zinc-700/50 w-fit">
        <FaRedo size={10} className="text-zinc-500 shrink-0" />
        <span className="text-xs text-zinc-400 whitespace-nowrap">Repeats</span>
        <input
          type="number"
          min={0}
          value={repeatInput}
          onChange={(e) => setRepeatInput(e.target.value)}
          onBlur={handleRepeatSave}
          onKeyDown={(e) => e.key === 'Enter' && handleRepeatSave()}
          disabled={!userMediaEntryId}
          className="w-10 text-center text-xs font-semibold text-white bg-zinc-700 border border-zinc-600 rounded px-1 py-0.5 focus:outline-none focus:border-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

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
