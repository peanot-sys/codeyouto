import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  theme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 w-full animate-fade-in"
      style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Logo + Name */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 3.5l7 4.5-7 4.5V3.5z" fill="white" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            MediaDrop
          </span>
        </div>

        {/* Right: Platform indicators + Theme */}
        <div className="flex items-center gap-3">
          {/* Platform indicators */}
          <div className="hidden sm:flex items-center gap-2">
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{
                background: 'rgba(255, 0, 0, 0.08)',
                color: '#ef4444',
                border: '1px solid rgba(255, 0, 0, 0.12)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              YouTube
            </span>
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{
                background: 'rgba(225, 48, 108, 0.08)',
                color: '#e1306c',
                border: '1px solid rgba(225, 48, 108, 0.12)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#e1306c' }} />
              Instagram
            </span>
          </div>

          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
