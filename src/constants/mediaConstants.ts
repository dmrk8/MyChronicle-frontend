export const MediaType = {
  ANIME: "ANIME",
  MANGA: "MANGA",
  GAME: "GAME",
  MOVIE: "MOVIE",
  TV: "TV",
} as const;

export type MediaType = typeof MediaType[keyof typeof MediaType];

export const MediaExternalSource = {
  ANILIST: "ANILIST",
  TMDB: "TMDB",
  IGDB: "IGDB",
} as const;

export type MediaExternalSource = typeof MediaExternalSource[keyof typeof MediaExternalSource];

