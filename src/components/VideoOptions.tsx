import { VideoQuality } from '../types/media';
import { Monitor } from 'lucide-react';

interface VideoOptionsProps {
  qualities: VideoQuality[];
  selected: VideoQuality;
  onChange: (quality: VideoQuality) => void;
}

export function VideoOptions({ qualities, selected, onChange }: VideoOptionsProps) {
  return (
    <div className="animate-fade-in">
      <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-secondary)' }}>
        <Monitor size={14} className="inline mr-1.5" />
        Quality
      </label>
      <div className="flex flex-wrap gap-2">
        {qualities.map((quality) => (
          <button
            key={quality}
            onClick={() => onChange(quality)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: selected === quality
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'var(--bg-glass)',
              color: selected === quality ? 'white' : 'var(--text-primary)',
              border: `1px solid ${selected === quality ? 'transparent' : 'var(--border-color)'}`,
              boxShadow: selected === quality ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none',
            }}
            aria-pressed={selected === quality}
          >
            {quality}
          </button>
        ))}
      </div>
    </div>
  );
}
