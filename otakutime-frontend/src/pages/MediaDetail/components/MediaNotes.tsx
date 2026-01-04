import { useState, useRef, useEffect } from 'react';
import { FaEdit, FaSave, FaStickyNote, FaTrash } from 'react-icons/fa';
import type { Review, ReviewUpdate } from '../../../types/Review';

interface MediaNotesProps {
  review?: Review;
  onSave: (reviewId: string | undefined, update: ReviewUpdate) => Promise<void>;
  onDelete?: (reviewId: string) => Promise<void>;
  mediaTitle: string;
  showDelete?: boolean;
}

const getScoreColor = (score?: number | null) => {
  if (!score) return 'text-zinc-400';
  if (score >= 8) return 'text-green-400';
  if (score >= 7) return 'text-blue-400';
  if (score >= 6) return 'text-yellow-400';
  return 'text-orange-400';
};

export const MediaNotes = ({
  review,
  onSave,
  onDelete,
  mediaTitle,
  showDelete = false,
}: MediaNotesProps) => {
  const [notes, setNotes] = useState(review?.review || '');
  const [rating, setRating] = useState(review?.rating || 0);
  const [isEditing, setIsEditing] = useState(!review); // Auto-edit if new
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setHasChanges(
      notes !== (review?.review || '') || rating !== (review?.rating || 0)
    );
  }, [notes, rating, review]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      autoResize(textareaRef.current);
    }
  }, [isEditing]);

  const autoResize = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(review?.id, { review: notes, rating });
      setIsEditing(false);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!review?.id || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(review.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancel = () => {
    setNotes(review?.review || '');
    setRating(review?.rating || 0);
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    autoResize(e.target);
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 10) {
      setRating(Math.round(value * 10) / 10);
    } else if (e.target.value === '') {
      setRating(0);
    }
  };

  return (
    <div className="relative group">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl border-2 border-zinc-700 shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-red-500/30 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <FaTrash className="text-red-400" />
                Delete Review?
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-zinc-300 text-sm">
                Are you sure you want to permanently delete this review? This
                action cannot be undone.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-zinc-700 disabled:to-zinc-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-red-500/20 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 rounded-2xl border-2 border-zinc-700/50 shadow-2xl backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-blue-500/10 hover:border-zinc-600/60">
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-800/90 to-zinc-800/70 px-6 py-4 border-b-2 border-zinc-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-700 rounded-lg">
              <FaStickyNote className="text-blue-400" size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {review ? 'Review & Notes' : 'New Review'}
              </h3>
              <p className="text-xs text-zinc-400">
                Personal thoughts and rating
              </p>
            </div>
          </div>

          {!isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <FaEdit size={13} />
                Edit
              </button>
              {showDelete && review && onDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-600 hover:bg-red-600 disabled:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:cursor-not-allowed"
                >
                  <FaTrash size={13} />
                  Delete
                </button>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-zinc-700 disabled:to-zinc-700 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none"
              >
                <FaSave size={13} />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-gray-200 rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Rating Section */}
        <div className="px-5 py-4 bg-zinc-800/30 border-b border-zinc-700/30">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-white">My Rating:</span>

            <div className="flex items-center gap-3">
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={rating || ''}
                  onChange={handleRatingChange}
                  className="w-24 px-3 py-2 bg-zinc-900 border-2 border-zinc-600 rounded-lg text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.0"
                />
              ) : (
                <div
                  className={`px-4 py-2 bg-gradient-to-r from-zinc-700 to-zinc-800 rounded-lg shadow-md ${
                    rating > 0 ? '' : 'opacity-50'
                  }`}
                >
                  <span
                    className={`text-2xl font-bold ${getScoreColor(rating)}`}
                  >
                    {rating > 0 ? rating.toFixed(1) : '—'}
                  </span>
                  <span className="text-sm font-medium text-zinc-400 ml-1">
                    /10
                  </span>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <p className="text-xs text-zinc-400 mt-2">
              Enter a rating between 0.0 and 10.0
            </p>
          )}
        </div>

        {/* Notes Area */}
        <div className="p-5">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={notes}
              onChange={handleTextareaChange}
              placeholder={`Share your personal thoughts about ${mediaTitle}...\n\nWhat resonated with you? Any memorable moments?\nWould you recommend it to others?`}
              className="w-full min-h-[240px] px-4 py-3 bg-zinc-900/60 border-2 border-zinc-700 rounded-xl text-gray-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all font-sans text-sm leading-relaxed shadow-inner"
              maxLength={5000}
            />
          ) : (
            <div
              className="min-h-[240px] px-4 py-3 text-gray-200 whitespace-pre-wrap font-sans text-sm leading-relaxed cursor-text hover:bg-zinc-800/30 rounded-xl transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {notes || (
                <span className="text-zinc-500 italic flex items-center gap-2">
                  Click to share your thoughts about {mediaTitle}...
                </span>
              )}
            </div>
          )}

          {isEditing && (
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-700/30">
              <span className="text-xs text-zinc-500">
                {notes.length} characters
              </span>
              {notes.length === 5000 ? (
                <span className="text-xs text-red-400 font-medium">
                  Character limit reached
                </span>
              ) : notes.length > 4500 ? (
                <span className="text-xs text-orange-400 font-medium">
                  Character limit approaching
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
