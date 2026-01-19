import { useState } from 'react';
import type {
  AnimeDetailed,
  MangaDetailed,
  MovieDetailed,
  TVDetailed,
} from '../../../types/Media';

interface MediaInfoProps {
  anime?: AnimeDetailed;
  manga?: MangaDetailed;
  movie?: MovieDetailed;
  tv?: TVDetailed;
}

export const MediaTags = ({ anime, manga, movie, tv }: MediaInfoProps) => {
  const [showSpoilers, setShowSpoilers] = useState(false);

  const media = anime || manga || movie || tv;
  if (!media) return null;

  const tags = anime?.tags || manga?.tags || [];
  const keywords = movie?.keywords || tv?.keywords || [];

  // Separate spoiler and non-spoiler tags
  const regularTags = tags.filter(
    (tag) => !tag.isMediaSpoiler && !tag.isGeneralSpoiler,
  );
  const spoilerTags = tags.filter(
    (tag) => tag.isMediaSpoiler || tag.isGeneralSpoiler,
  );

  const allTags = [...regularTags.map((tag) => tag.name), ...keywords];
  const hasSpoilers = spoilerTags.length > 0;

  if (allTags.length === 0 && !hasSpoilers) return null;

  return (
    <div className="mt-4 bg-zinc-800/50 rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-3 text-zinc-400">Tags</h3>

      {/* Regular Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {anime &&
            regularTags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-700/50 text-zinc-300 border border-zinc-600/30"
              >
                {tag.name}
              </span>
            ))}
          {manga &&
            regularTags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-700/50 text-zinc-300 border border-zinc-600/30"
              >
                {tag.name}
              </span>
            ))}
          {movie &&
            keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-700/50 text-zinc-300 border border-zinc-600/30"
              >
                {keyword}
              </span>
            ))}
          {tv &&
            keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-700/50 text-zinc-300 border border-zinc-600/30"
              >
                {keyword}
              </span>
            ))}
        </div>
      )}

      {/* Spoiler Tags Section */}
      {hasSpoilers && (
        <div className="border-t border-zinc-700/50 pt-3">
          <button
            onClick={() => setShowSpoilers(!showSpoilers)}
            className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-700/50 text-zinc-300 border border-zinc-600/30 hover:bg-zinc-700 transition-colors"
          >
            <span> Spoiler Tags</span>
            <span className="text-xs">
              {showSpoilers ? '(Click to hide)' : '(Click to reveal)'}
            </span>
          </button>

          {showSpoilers && (
            <div className="flex flex-wrap gap-2 mt-2">
              {spoilerTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-700/50 text-zinc-300 border border-zinc-600/30"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
