export function Footer() {
  return (
    <footer className="mt-auto py-8 px-4">
      <div className="max-w-5xl mx-auto text-center space-y-3">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M5 3.5l7 4.5-7 4.5V3.5z" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            MediaDrop
          </span>
        </div>

        {/* Tagline */}
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Fast. Simple. Private.
        </p>

        {/* Platforms */}
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          YouTube • Instagram
        </p>

        {/* Privacy note */}
        <p className="text-xs pt-2" style={{ color: 'var(--text-muted)' }}>
          No account required. No history. Temporary files are automatically cleaned up.
        </p>
      </div>
    </footer>
  );
}
