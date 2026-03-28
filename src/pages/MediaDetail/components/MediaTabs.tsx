import { useState } from 'react';
import type {
  AnimeDetailed,
  MangaDetailed,
  MovieDetailed,
  TVDetailed,
} from '../../../types/Media';
import { MediaType } from '../../../constants/mediaConstants';
import { MediaOverview } from './MediaOverview';
import { MediaNotesCarousel } from './MediaNotesCarousel';

interface MediaTabsProps {
  anime?: AnimeDetailed;
  manga?: MangaDetailed;
  movie?: MovieDetailed;
  tv?: TVDetailed;
  mediaType: MediaType;
  mediaTitle: string;
  userMediaEntryId?: string;
  repeatCount?: number;
}

type TabType = 'overview' | 'notes';

export const MediaTabs = ({
  anime,
  manga,
  movie,
  tv,
  mediaType,
  mediaTitle,
  userMediaEntryId,
  repeatCount,
}: MediaTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'notes', label: 'Notes' },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-medium transition-all duration-200 relative ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-100">
        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-200">
            <MediaOverview
              anime={anime}
              manga={manga}
              movie={movie}
              tv={tv}
              mediaType={mediaType}
            />
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="animate-in fade-in duration-200">
            <MediaNotesCarousel
              mediaTitle={mediaTitle}
              userMediaEntryId={userMediaEntryId}
              repeatCount={repeatCount}
            />
          </div>
        )}
      </div>
    </div>
  );
};
