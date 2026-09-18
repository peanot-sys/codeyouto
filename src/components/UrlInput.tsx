import { useState, useRef } from 'react';
import { Link, Clipboard, Search, Loader2 } from 'lucide-react';

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
  error?: string | null;
}

export function UrlInput({ onAnalyze, isAnalyzing, error }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      inputRef.current?.focus();
    } catch {
      // Clipboard not available
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isAnalyzing) {
      onAnalyze(url.trim());
    }
  };

  return (
    <div className="w-full animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <form onSubmit={handleSubmit} className="relative">
        <div
          className="glass-card p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          style={{ transition: 'box-shadow 0.3s ease' }}
        >
          {/* URL Input */}
          <div className="flex-1 flex items-center gap-2 px-3">
            <Link size={18} style={{ color: 'var(--text-muted)' }} />
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube or Instagram link"
              className="flex-1 bg-transparent border-none outline-none text-base py-3"
              style={{ color: 'var(--text-primary)' }}
              disabled={isAnalyzing}
              aria-label="Media URL"
            />
            {/* Paste button */}
            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
              }}
              title="Paste from clipboard"
              aria-label="Paste from clipboard"
            >
              <Clipboard size={14} />
              <span className="hidden sm:inline">Paste</span>
            </button>
          </div>

          {/* Analyze button */}
          <button
            type="submit"
            disabled={!url.trim() || isAnalyzing}
            className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-xl whitespace-nowrap"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Search size={18} />
                <span>Analyze</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error message */}
      {error && (
        <div className="mt-3 animate-fade-in">
          <p className="text-sm text-red-500 flex items-center gap-2 px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
