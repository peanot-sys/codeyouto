import { DownloadSettings, MediaInfo, Platform } from '../types/media';
import { formatTime } from '../utils/time';
import { getPlatformLabel } from '../utils/platform';
import { Download, Film, Music } from 'lucide-react';

interface DownloadSummaryProps {
  media: MediaInfo;
  settings: DownloadSettings;
  onDownload: () => void;
  isProcessing: boolean;
}

export function DownloadSummary({ media, settings, onDownload, isProcessing }: DownloadSummaryProps) {
  const rows = [
    { label: 'Source', value: getPlatformLabel(media.platform) },
    { label: 'Type', value: settings.type === 'video' ? 'Video' : 'Audio' },
    { label: 'Format', value: settings.type === 'video' ? 'MP4' : settings.format.toUpperCase() },
    { label: 'Quality', value: settings.quality },
    { label: 'Start', value: formatTime(settings.startTime) },
    { label: 'End', value: formatTime(settings.endTime) },
    { label: 'Duration', value: formatTime(settings.endTime - settings.startTime) },
  ];

  return (
    <div className="glass-card p-5 sm:p-6 animate-fade-in-up">
      <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <Download size={18} className="text-indigo-500" />
        Your Download
      </h3>

      <div className="space-y-2.5 mb-6">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-1.5">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {row.label}
            </span>
            <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              {row.label === 'Type' && (
                settings.type === 'video' ? <Film size={14} className="text-indigo-500" /> : <Music size={14} className="text-indigo-500" />
              )}
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onDownload}
        disabled={isProcessing}
        className="btn-primary w-full py-4 text-base font-semibold flex items-center justify-center gap-2 rounded-xl"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Download size={20} />
            Download
          </>
        )}
      </button>
    </div>
  );
}
