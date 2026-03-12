import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchTmdbKeywords } from '../../../api/tmdbApi';
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
  const navigate = useNavigate();

  const media = anime || manga || movie || tv;
  if (!media) return null;

  const tags = anime?.tags || manga?.tags || [];
  const keywords = movie?.keywords || tv?.keywords || [];

  const mediaPath = anime ? 'anime' : manga ? 'manga' : movie ? 'movie' : 'tv';

  const handleAnilistTagClick = (tagName: string) => {
    const storageKey = `searchAnilist_${mediaPath}`;
    [
      'query',
      'sort',
      'season',
      'year',
      'status',
      'genres',
      'tags',
      'country',
      'adult',
      'format',
    ].forEach((key) => sessionStorage.removeItem(`${storageKey}_${key}`));
    sessionStorage.setItem(`${storageKey}_tags`, JSON.stringify([tagName]));
    navigate(`/${mediaPath}/search`);
  };

  const handleTmdbKeywordClick = async (keyword: string) => {
    const storageKey = `searchTmdb_${mediaPath}`;
    [
      'query',
      'sort',
      'genres',
      'year',
      'status',
      'language',
      'minRating',
      'runtimeMin',
      'runtimeMax',
      'runtimeEnabled',
      'dateFrom',
      'dateTo',
      'keywords',
    ].forEach((key) => sessionStorage.removeItem(`${storageKey}_${key}`));
    try {
      const results = await searchTmdbKeywords(keyword);
      const match = results.find(
        (k) => k.name.toLowerCase() === keyword.toLowerCase(),
      );
      if (match) {
        sessionStorage.setItem(
          `${storageKey}_keywords`,
          JSON.stringify([match]),
        );
      } else {
        sessionStorage.setItem(`${storageKey}_query`, keyword);
      }
    } catch {
      sessionStorage.setItem(`${storageKey}_query`, keyword);
    }
    navigate(`/${mediaPath}/search`);
  };

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

  const tagClass =
    'px-3 py-1 rounded-full text-xs font-medium bg-zinc-700/50 text-zinc-300 border border-zinc-600/30 cursor-pointer hover:bg-zinc-600/50 hover:text-white transition-colors relative group';

  return (
    <div className="mt-4 bg-zinc-800/50 rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-3 text-zinc-400">Tags</h3>

      {/* Regular Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {anime &&
            regularTags.map((tag, index) => (
              <button
                key={index}
                onClick={() => handleAnilistTagClick(tag.name)}
                className={tagClass}
              >
                {tag.name}
                {tag.description && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-950 text-zinc-100 text-xs rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 max-w-md whitespace-normal border border-zinc-700">
                    {tag.description}
                  </div>
                )}
              </button>
            ))}
          {manga &&
            regularTags.map((tag, index) => (
              <button
                key={index}
                onClick={() => handleAnilistTagClick(tag.name)}
                className={tagClass}
              >
                {tag.name}
                {tag.description && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-950 text-zinc-100 text-xs rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 max-w-md whitespace-normal border border-zinc-700">
                    {tag.description}
                  </div>
                )}
              </button>
            ))}
          {movie &&
            keywords.map((keyword, index) => (
              <button
                key={index}
                onClick={() => handleTmdbKeywordClick(keyword)}
                className={tagClass}
              >
                {keyword}
              </button>
            ))}
          {tv &&
            keywords.map((keyword, index) => (
              <button
                key={index}
                onClick={() => handleTmdbKeywordClick(keyword)}
                className={tagClass}
              >
                {keyword}
              </button>
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
                <button
                  key={index}
                  onClick={() => handleAnilistTagClick(tag.name)}
                  title={tag.description}
                  className={tagClass}
                >
                  {tag.name}
                  {tag.description && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-950 text-zinc-100 text-xs rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 max-w-md whitespace-normal border border-zinc-700">
                      {tag.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
