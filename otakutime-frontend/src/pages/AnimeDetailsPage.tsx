import { useNavigate, useParams } from 'react-router-dom';
import MediaDetails from '../components/MediaDetails';

export default function AnimeDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const mediaId = Number(id);
  if (!Number.isFinite(mediaId) || mediaId <= 0)
    return <div className="p-10">Invalid media id.</div>;

  return (
    <div className="max-w-full mx-80">
      <MediaDetails mediaId={mediaId} onBack={() => navigate(-1)} />
    </div>
  );
}
