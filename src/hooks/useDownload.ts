import { useState, useCallback } from 'react';
import { DownloadSettings, DownloadResult, ProcessingStage, MediaInfo } from '../types/media';
import { getDownloadUrl } from '../services/mediaService';

interface UseDownloadReturn {
  isProcessing: boolean;
  result: DownloadResult | null;
  progress: number;
  stage: ProcessingStage | null;
  error: string | null;
  download: (media: MediaInfo, settings: DownloadSettings) => Promise<void>;
  reset: () => void;
}

export function useDownload(): UseDownloadReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<ProcessingStage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async (media: MediaInfo, settings: DownloadSettings) => {
    setIsProcessing(true);
    setResult(null);
    setProgress(0);
    setError(null);
    setStage('preparing');

    try {
      // Get the download URL
      setStage('processing');
      setProgress(20);
      
      const downloadUrl = getDownloadUrl(media, settings.quality, settings.type);
      
      if (!downloadUrl) {
        throw new Error('Could not get download URL for the selected quality. Try a different quality.');
      }

      setStage('trimming');
      setProgress(60);

      // Generate filename
      const ext = settings.type === 'audio' ? settings.format : 'mp4';
      const safeTitle = media.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').slice(0, 50);
      const filename = `${safeTitle}_${settings.quality}.${ext}`;

      setStage('finalizing');
      setProgress(100);

      // Return the result with the download URL
      setResult({
        jobId: media.id,
        status: 'success',
        progress: 100,
        filename,
        downloadUrl,
        fileSize: 'Unknown',
      });
      
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while processing your file.');
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setResult(null);
    setProgress(0);
    setStage(null);
    setError(null);
  }, []);

  return { isProcessing, result, progress, stage, error, download, reset };
}
