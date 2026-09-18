import { useState, useCallback } from 'react';
import { MediaInfo, AppStatus } from '../types/media';
import { analyzeMedia } from '../services/mediaService';
import { validateUrl } from '../utils/validation';

interface UseMediaInfoReturn {
  status: AppStatus;
  mediaInfo: MediaInfo | null;
  error: string | null;
  analyze: (url: string) => Promise<void>;
  reset: () => void;
}

export function useMediaInfo(): UseMediaInfoReturn {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (url: string) => {
    const validation = validateUrl(url);
    if (!validation.valid) {
      setError(validation.error || 'Invalid URL');
      setStatus('error');
      return;
    }

    setStatus('analyzing');
    setError(null);
    setMediaInfo(null);

    try {
      const info = await analyzeMedia(url);
      setMediaInfo(info);
      setStatus('media-loaded');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze media. Backend service may be unavailable.');
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setMediaInfo(null);
    setError(null);
  }, []);

  return { status, mediaInfo, error, analyze, reset };
}
