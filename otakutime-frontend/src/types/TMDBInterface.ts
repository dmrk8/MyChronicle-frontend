interface TMDBGenre {
  id: number;
  name: string;
}

interface TMDBProductionCompany {
  id: number;
  logoPath?: string;
  name: string;
  originCountry: string;
}

interface TMDBSpokenLanguage {
  englishName: string;
  iso6391: string;
  name: string;
}

interface TMDBBelongsToCollection {
  id: number;
  name: string;
  posterPath?: string;
  backdropPath?: string;
}

interface TMDBCreatedBy {
  id: number;
  creditId: string;
  name: string;
  originalName: string;
  gender: number;
  profilePath?: string;
}

interface TMDBLastEpisodeToAir {
  id: number;
  name: string;
  overview: string;
  voteAverage: number;
  voteCount: number;
  airDate: string;
  episodeNumber: number;
  episodeType: string;
  productionCode: string;
  runtime: number;
  seasonNumber: number;
  showId: number;
  stillPath?: string;
}

interface TMDBNetwork {
  id: number;
  logoPath?: string;
  name: string;
  originCountry: string;
}

interface TMDBSeason {
  airDate?: string;
  episodeCount: number;
  id: number;
  name: string;
  overview: string;
  posterPath?: string;
  seasonNumber: number;
  voteAverage: number;
}

interface TMDBKeyword {
  id: number;
  name: string;
}

interface TMDBTvKeywords {
  results: TMDBKeyword[];
}

interface TMDBMovieKeywords {
  keywords: TMDBKeyword[];
}

interface TMDBExternalIds {
  imdbId?: string;
  freebase_mid?: string;
  freebase_id?: string;
  tvdb_id?: number;
  tvrage_id?: number;
  wikidata_id?: string;
  facebook_id?: string;
  instagram_id?: string;
  twitter_id?: string;
}

interface TMDBCollectionPart {
  adult: boolean;
  backdropPath?: string;
  id: number;
  title: string;
  originalTitle: string;
  mediaType: string;
  releaseDate: string;
  video: boolean;
  voteAverage: number;
  voteCount: number;
}

interface TMDBCollection {
  id: number;
  name: string;
  overview: string;
  posterPath?: string;
  backdropPath?: string;
  parts: TMDBCollectionPart[];
}

interface TMDBMediaMinimal {
  adult: boolean;
  backdropPath?: string;
  genreIds: number[];
  id: number;
  originalLanguage: string;
  popularity: number;
  mediaType?: string;
  voteAverage: number;
  title?: string;
  originalTitle?: string;
  releaseDate?: string;
  name?: string;
  originalName?: string;
  firstAirDate?: string;
  originCountry?: string[];
}

interface TMDBPageInfo {
  page: number;
  totalPages: number;
  totalResults: number;
}

interface TMDBPagination {
  results: TMDBMediaMinimal[];
  page: number;
  totalPages: number;
  totalResults: number;
}

interface TMDBMediaDetailBase {
  adult: boolean;
  backdropPath?: string;
  genres: TMDBGenre[];
  id: number;
  imdbId?: string;
  originCountry: string[];
  originalLanguage: string;
  overview: string;
  popularity: number;
  posterPath?: string;
  productionCompanies: TMDBProductionCompany[];
  spokenLanguages: TMDBSpokenLanguage[];
  status: string;
  tagline?: string;
  voteAverage: number;
  voteCount?: number;
  mediaType?: string;
}

interface TMDBMovieDetail extends TMDBMediaDetailBase {
  belongsToCollection?: TMDBBelongsToCollection;
  budget?: number;
  originalTitle?: string;
  releaseDate?: string;
  revenue?: number;
  runtime?: number;
  title?: string;
  keywords?: TMDBMovieKeywords;
}

interface TMDBTVDetail extends TMDBMediaDetailBase {
  createdBy?: TMDBCreatedBy[];
  episodeRunTime?: number[];
  firstAirDate?: string;
  inProduction?: boolean;
  languages?: string[];
  lastAirDate?: string;
  externalIds?: TMDBExternalIds;
  lastEpisodeToAir?: TMDBLastEpisodeToAir;
  name?: string;
  nextEpisodeToAir?: TMDBLastEpisodeToAir;
  networks?: TMDBNetwork[];
  numberOfEpisodes?: number;
  numberOfSeasons?: number;
  originalName?: string;
  seasons?: TMDBSeason[];
  type?: string;
  keywords?: TMDBTvKeywords;
}