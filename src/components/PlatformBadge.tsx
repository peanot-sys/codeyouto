import { Platform } from '../types/media';
import { getPlatformLabel } from '../utils/platform';

interface PlatformBadgeProps {
  platform: Platform;
}

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const isYoutube = platform === 'youtube';
  
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
      style={{
        background: isYoutube ? 'rgba(255, 0, 0, 0.08)' : 'rgba(225, 48, 108, 0.08)',
        color: isYoutube ? '#ef4444' : '#e1306c',
        border: `1px solid ${isYoutube ? 'rgba(255, 0, 0, 0.15)' : 'rgba(225, 48, 108, 0.15)'}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: isYoutube ? '#ef4444' : '#e1306c' }}
      />
      {getPlatformLabel(platform)}
    </span>
  );
}
