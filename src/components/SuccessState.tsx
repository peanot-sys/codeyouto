import { DownloadResult } from '../types/media';
import { CheckCircle, Download, RotateCcw, ExternalLink } from 'lucide-react';

interface SuccessStateProps {
  result: DownloadResult;
  onDownloadFile: () => void;
  onDownloadAnother: () => void;
}

export function SuccessState({ result, onDownloadFile, onDownloadAnother }: SuccessStateProps) {
  return (
    <div className="glass-card p-6 sm:p-8 text-center animate-fade-in-up">
      {/* Success icon */}
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))' }}
      >
        <CheckCircle size={32} className="text-green-500" />
      </div>

      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        Your file is ready!
      </h3>

      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        Click the button below to start downloading.
      </p>

      {/* File info */}
      <div className="glass-card-sm p-4 mt-4 mb-6 inline-block">
        <p className="text-sm font-medium font-mono" style={{ color: 'var(--text-primary)' }}>
          {result.filename || 'media_clip.mp4'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onDownloadFile}
          className="btn-primary flex items-center justify-center gap-2 px-6 py-4 text-base"
        >
          <Download size={20} />
          Download File
        </button>
        
        <button
          onClick={onDownloadAnother}
          className="btn-secondary flex items-center justify-center gap-2 px-6 py-3"
        >
          <RotateCcw size={18} />
          Download Another
        </button>
      </div>

      {/* Help note */}
      <p className="text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
        If the download doesn't start automatically, the file will open in a new tab. 
        Right-click and "Save As" to save it.
      </p>
    </div>
  );
}
