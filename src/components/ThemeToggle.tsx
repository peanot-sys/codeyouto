import { Moon, Sun, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark' | 'system';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const getIcon = () => {
    switch (theme) {
      case 'light': return <Sun size={18} />;
      case 'dark': return <Moon size={18} />;
      default: return <Monitor size={18} />;
    }
  };

  return (
    <button
      onClick={onToggle}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105"
      style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
      }}
      aria-label={`Current theme: ${theme}. Click to change.`}
      title={`Theme: ${theme}`}
    >
      {getIcon()}
    </button>
  );
}
