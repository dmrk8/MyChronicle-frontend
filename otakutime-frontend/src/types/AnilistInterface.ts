interface Title {
  english?: string;
  romaji?: string;
  native?: string;
}

interface NextAiringEpisode {
  episode?: number;
  airingAt?: number;
  timeUntilAiring?: number;
}

interface MediaDate {
  year?: number;
  month?: number;
  day?: number;
}

interface CoverImage {
  medium?: string;
  large?: string;
}

interface Tag {
  name: string;
  isMediaSpoiler: boolean;
  isGeneralSpoiler: boolean;
  rank: number;
}

interface RelationNode {
  id: number;
  title: Title;
  format?: string;
  status?: string;
}

interface RelationEdge {
  relationType: string;
  node: RelationNode;
}

interface Relations {
  edges: RelationEdge[];
}

interface StudioNode {
  id: number;
  name: string;
}

interface StudioEdge {
  isMain: boolean;
  node: StudioNode;
}

interface Studios {
  edges: StudioEdge[];
}

interface AnilistMediaMinimal {
  id: number;
  title: Title;
  format?: string;
  genres?: string[];
  episodes?: number;
  duration?: number;
  chapters?: number;
  status?: string;
  startDate?: MediaDate;
  endDate?: MediaDate;
  nextAiringEpisode?: NextAiringEpisode;
  mainStudio?: string;
  coverImage?: CoverImage;
  season?: string;
  seasonYear?: number;
  averageScore?: number;
}

interface AnilistMediaDetailed {
  id: number;
  averageScore?: number;
  bannerImage?: string;
  chapters?: number;
  countryOfOrigin?: string;
  coverImage: CoverImage;
  description?: string;
  duration?: number;
  endDate?: MediaDate;
  episodes?: number;
  format?: string;
  genres?: string[];
  isAdult?: boolean;
  nextAiringEpisode?: NextAiringEpisode;
  relations: Relations;
  season?: string;
  seasonYear?: number;
  source?: string;
  startDate?: MediaDate;
  status?: string;
  synonyms?: string[];
  title: Title;
  type: string;
  volumes?: number;
  tags: Tag[];
  studios: Studios;
}

interface AnilistPageInfo {
  currentPage: number;
  hasNextPage: boolean;
  perPage: number;
  total: number;
}

interface AnilistPagination {
  results: AnilistMediaMinimal[];
  currentPage: number;
  perPage: number;
  hasNextPage: boolean;
  total: number;
}