import { Video, Music } from 'lucide-react';
import { MediaType } from '../types/media';

interface MediaTypeSelectorProps {
  selected: MediaType;
  onChange: (type: MediaType) => void;
}

export function MediaTypeSelector({ selected, onChange }: MediaTypeSelectorProps) {
  return (
    <div className="animate-fade-in-up">
      <div
        className="glass-card-sm p-1.5 flex rounded-xl relative"
        style={{ gap: '4px' }}
      >
        {/* Sliding indicator */}
        <div
          className="absolute top-1.5 bottom-1.5 rounded-lg transition-all duration-300 ease-out"
          style={{
            width: 'calc(50% - 6px)',
            left: selected === 'video' ? '6px' : 'calc(50% + 2px)',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
          }}
        />

        <button
          onClick={() => onChange('video')}
          className="relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-colors duration-200"
          style={{
            color: selected === 'video' ? 'white' : 'var(--text-secondary)',
          }}
          aria-pressed={selected === 'video'}
        >
          <Video size={18} />
          <span>Video</span>
        </button>

        <button
          onClick={() => onChange('audio')}
          className="relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-colors duration-200"
          style={{
            color: selected === 'audio' ? 'white' : 'var(--text-secondary)',
          }}
          aria-pressed={selected === 'audio'}
        >
          <Music size={18} />
          <span>Audio</span>
        </button>
      </div>
    </div>
  );
}
