import { AudioFormat, AudioQuality } from '../types/media';
import { Headphones } from 'lucide-react';

interface AudioOptionsProps {
  formats: AudioFormat[];
  qualities: AudioQuality[];
  selectedFormat: AudioFormat;
  selectedQuality: AudioQuality;
  onFormatChange: (format: AudioFormat) => void;
  onQualityChange: (quality: AudioQuality) => void;
}

export function AudioOptions({
  formats,
  qualities,
  selectedFormat,
  selectedQuality,
  onFormatChange,
  onQualityChange,
}: AudioOptionsProps) {
  return (
    <div className="animate-fade-in space-y-4">
      {/* Format */}
      <div>
        <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-secondary)' }}>
          <Headphones size={14} className="inline mr-1.5" />
          Format
        </label>
        <div className="flex flex-wrap gap-2">
          {formats.map((format) => (
            <button
              key={format}
              onClick={() => onFormatChange(format)}
              className="px-4 py-2 rounded-xl text-sm font-medium uppercase transition-all duration-200"
              style={{
                background: selectedFormat === format
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'var(--bg-glass)',
                color: selectedFormat === format ? 'white' : 'var(--text-primary)',
                border: `1px solid ${selectedFormat === format ? 'transparent' : 'var(--border-color)'}`,
                boxShadow: selectedFormat === format ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none',
              }}
              aria-pressed={selectedFormat === format}
            >
              {format}
            </button>
          ))}
        </div>
      </div>

      {/* Quality */}
      <div>
        <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-secondary)' }}>
          Quality
        </label>
        <div className="flex flex-wrap gap-2">
          {qualities.map((quality) => (
            <button
              key={quality}
              onClick={() => onQualityChange(quality)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: selectedQuality === quality
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'var(--bg-glass)',
                color: selectedQuality === quality ? 'white' : 'var(--text-primary)',
                border: `1px solid ${selectedQuality === quality ? 'transparent' : 'var(--border-color)'}`,
                boxShadow: selectedQuality === quality ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none',
              }}
              aria-pressed={selectedQuality === quality}
            >
              {quality}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
