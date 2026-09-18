import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  onStartOver?: () => void;
}

export function ErrorState({ error, onRetry, onStartOver }: ErrorStateProps) {
  return (
    <div className="glass-card p-6 sm:p-8 text-center animate-fade-in-up">
      {/* Error icon */}
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))' }}
      >
        <AlertCircle size={32} className="text-red-500" />
      </div>

      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        Something went wrong
      </h3>

      <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
        {error}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
          >
            <RefreshCw size={18} />
            Retry
          </button>
        )}
        {onStartOver && (
          <button
            onClick={onStartOver}
            className="btn-secondary flex items-center justify-center gap-2 px-6 py-3"
          >
            <Home size={18} />
            Start Over
          </button>
        )}
      </div>
    </div>
  );
}
