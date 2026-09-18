import { useState, useCallback, useRef, useEffect } from 'react';
import { DownloadSettings, DownloadResult, ProcessingStage, MediaInfo } from '../types/media';
import { startDownload, getDownloadStatus } from '../services/mediaService';

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
  const pollIntervalRef = useRef<number | null>(null);

  const download = useCallback(async (media: MediaInfo, settings: DownloadSettings) => {
    setIsProcessing(true);
    setResult(null);
    setProgress(0);
    setError(null);
    setStage('preparing');

    try {
      // Start download job
      const jobResponse = await startDownload({
        url: media.url,
        type: settings.type,
        format: settings.format,
        quality: settings.quality,
        startTime: settings.startTime,
        endTime: settings.endTime,
      });

      const jobId = jobResponse.jobId;
      if (!jobId) {
        throw new Error('No job ID received from backend');
      }

      setStage('processing');
      setProgress(10);

      // Poll for status
      const pollStatus = async () => {
        try {
          const statusResponse = await getDownloadStatus(jobId);
          
          if (!statusResponse.success || !statusResponse.data) {
            throw new Error(statusResponse.error || 'Failed to get job status');
          }

          const statusData = statusResponse.data;
          setProgress(statusData.progress || 0);

          // Map backend status to frontend stage
          switch (statusData.status) {
            case 'queued':
              setStage('preparing');
              break;
            case 'preparing':
              setStage('preparing');
              break;
            case 'processing':
              setStage('processing');
              break;
            case 'trimming':
              setStage('trimming');
              break;
            case 'converting':
              setStage('converting');
              break;
            case 'completed':
              setStage('finalizing');
              setProgress(100);
              
              // Stop polling
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }

              // Set result
              const API_URL = import.meta.env.VITE_API_URL || '';
              setResult({
                jobId,
                status: 'success',
                progress: 100,
                filename: `download.${settings.type === 'audio' ? settings.format : 'mp4'}`,
                downloadUrl: `${API_URL}${statusData.downloadUrl}`,
                fileSize: 'Unknown',
              });
              
              setIsProcessing(false);
              break;
            case 'failed':
              throw new Error(statusData.error || 'Processing failed');
          }
        } catch (err: any) {
          // Stop polling on error
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setError(err.message || 'Failed to check job status');
          setIsProcessing(false);
        }
      };

      // Start polling every 2 seconds
      pollIntervalRef.current = window.setInterval(pollStatus, 2000);
      
      // Initial poll
      pollStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to start download');
      setIsProcessing(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const reset = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsProcessing(false);
    setResult(null);
    setProgress(0);
    setStage(null);
    setError(null);
  }, []);

  return { isProcessing, result, progress, stage, error, download, reset };
}
