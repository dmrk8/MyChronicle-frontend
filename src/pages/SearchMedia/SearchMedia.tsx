import { useParams } from 'react-router-dom';
import { MediaType } from '../../constants/mediaConstants';
import SearchAnilist from './components/SearchAnilist';
import SearchTmdb from './components/SearchTmdb';
import NotFound from '../NotFound';

const SearchMedia = () => {
  const { mediaType } = useParams<{ mediaType: string }>();

  if (!mediaType) {
    return <NotFound />;
  }

  // Normalize the media type from URL parameter
  const normalizedMediaType = mediaType.toUpperCase() as MediaType;

  // Validate media type against enum values
  const validMediaTypes = Object.values(MediaType) as string[];
  if (!validMediaTypes.includes(normalizedMediaType)) {
    return <NotFound />;
  }

  // Route to appropriate search component based on media type
  switch (normalizedMediaType) {
    case MediaType.ANIME:
    case MediaType.MANGA:
      return (
        <SearchAnilist
          key={normalizedMediaType}
          mediaType={normalizedMediaType}
        />
      );
    case MediaType.MOVIE:
    case MediaType.TV:
      return (
        <SearchTmdb key={normalizedMediaType} mediaType={normalizedMediaType} />
      );
    default:
      return <NotFound />;
  }
};

export default SearchMedia;
