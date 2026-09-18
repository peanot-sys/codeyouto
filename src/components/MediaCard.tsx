import { useState } from 'react';
import { MediaInfo } from '../types/media';
import { PlatformBadge } from './PlatformBadge';
import { formatDuration } from '../utils/time';
import { Clock, User, Play, ExternalLink } from 'lucide-react';

interface MediaCardProps {
  media: MediaInfo;
}

export function MediaCard({ media }: MediaCardProps) {
  const [imgError, setImgError] = useState(false);
  const hasThumbnail = media.thumbnail && !imgError;

  return (
    <div className="glass-card p-4 sm:p-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Thumbnail */}
        <div className="relative w-full sm:w-56 flex-shrink-0">
          <div className="aspect-video sm:aspect-[4/3] rounded-xl overflow-hidden relative"
            style={{ background: 'var(--bg-glass)' }}
          >
            {hasThumbnail ? (
              <img
                src={media.thumbnail}
                alt={media.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))' }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(99, 102, 241, 0.15)' }}
                >
                  <Play size={20} className="text-indigo-500 ml-0.5" fill="currentColor" />
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {media.platform === 'youtube' ? 'YouTube' : 'Instagram'}
                </span>
              </div>
            )}

            {/* Duration overlay */}
            {media.duration > 0 && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-xs font-medium bg-black/70 text-white backdrop-blur-sm">
                {formatDuration(media.duration)}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-center gap-3 min-w-0">
          <h3
            className="text-lg font-semibold leading-snug line-clamp-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {media.title}
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            <PlatformBadge platform={media.platform} url={media.url} />
            
            {media.duration > 0 && (
              <span
                className="flex items-center gap-1.5 text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Clock size={14} />
                {formatDuration(media.duration)}
              </span>
            )}

            {media.creator && (
              <span
                className="flex items-center gap-1.5 text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                <User size={14} />
                {media.creator}
              </span>
            )}
          </div>

          {/* Open original link */}
          <a
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: '#6366f1' }}
          >
            <ExternalLink size={12} />
            Open original
          </a>
        </div>
      </div>
    </div>
  );
}

// Skeleton loading card
export function MediaCardSkeleton() {
  return (
    <div className="glass-card p-4 sm:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="w-full sm:w-56 flex-shrink-0">
          <div className="aspect-video sm:aspect-[4/3] rounded-xl skeleton" />
        </div>
        <div className="flex-1 flex flex-col justify-center gap-3">
          <div className="h-5 w-3/4 skeleton" />
          <div className="h-4 w-1/2 skeleton" />
          <div className="flex gap-3">
            <div className="h-6 w-20 skeleton rounded-full" />
            <div className="h-6 w-16 skeleton rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
