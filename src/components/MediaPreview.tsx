import { MediaInfo } from '../types/media';
import { extractYouTubeId, extractInstagramShortcode, getYouTubeEmbedUrl, getInstagramEmbedUrl } from '../services/mediaService';
import { Eye } from 'lucide-react';

interface MediaPreviewProps {
  media: MediaInfo;
  startTime: number;
  endTime: number;
  previewOnly: boolean;
}

export function MediaPreview({ media, startTime, endTime, previewOnly }: MediaPreviewProps) {
  const renderEmbed = () => {
    if (media.platform === 'youtube') {
      const videoId = extractYouTubeId(media.url);
      if (!videoId) return <div className="w-full h-full flex items-center justify-center text-gray-400">Video unavailable</div>;
      
      const embedUrl = previewOnly
        ? getYouTubeEmbedUrl(videoId, startTime, endTime)
        : getYouTubeEmbedUrl(videoId);
      
      return (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="Video preview"
        />
      );
    }
    
    if (media.platform === 'instagram') {
      const shortcode = extractInstagramShortcode(media.url);
      if (!shortcode) return <div className="w-full h-full flex items-center justify-center text-gray-400">Reel unavailable</div>;
      
      return (
        <iframe
          src={getInstagramEmbedUrl(shortcode)}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          title="Instagram preview"
          style={{ background: 'white' }}
        />
      );
    }
    
    return <div className="w-full h-full flex items-center justify-center text-gray-400">Preview not available</div>;
  };

  return (
    <div className="glass-card overflow-hidden animate-fade-in-up">
      {/* Embed container */}
      <div className="relative aspect-video bg-black">
        {renderEmbed()}
        
        {/* Preview badge */}
        {previewOnly && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/90 text-white backdrop-blur-sm flex items-center gap-1.5 z-10">
            <Eye size={12} />
            Previewing Selection
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className="p-3 sm:p-4 flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {previewOnly ? 'Playing selected portion only' : 'Full video preview'}
        </span>
        {previewOnly && (
          <span className="text-xs font-medium px-2 py-0.5 rounded" style={{
            background: 'rgba(99, 102, 241, 0.1)',
            color: '#6366f1',
          }}>
            Trimmed Preview
          </span>
        )}
      </div>
    </div>
  );
}
