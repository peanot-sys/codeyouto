import { useState, useCallback, useRef } from 'react';
import { DownloadSettings, DownloadResult, ProcessingStage } from '../types/media';
import { startDownload, getDownloadStatus } from '../services/mediaService';

interface UseDownloadReturn {
  isProcessing: boolean;
  result: DownloadResult | null;
  progress: number;
  stage: ProcessingStage | null;
  error: string | null;
  download: (url: string, settings: DownloadSettings) => Promise<void>;
  reset: () => void;
}

const STAGES: ProcessingStage[] = ['preparing', 'processing', 'trimming', 'converting', 'finalizing'];

export function useDownload(): UseDownloadReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<ProcessingStage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const download = useCallback(async (url: string, settings: DownloadSettings) => {
    setIsProcessing(true);
    setResult(null);
    setProgress(0);
    setError(null);
    setStage('preparing');

    try {
      const response = await startDownload({
        url,
        type: settings.type,
        format: settings.format,
        quality: settings.quality,
        startTime: settings.startTime,
        endTime: settings.endTime,
      });

      if (response?.jobId) {
        // Poll for status
        let currentStageIndex = 0;
        let currentProgress = 0;

        intervalRef.current = window.setInterval(async () => {
          currentProgress = Math.min(currentProgress + Math.random() * 15 + 5, 95);
          setProgress(Math.round(currentProgress));

          const newStageIndex = Math.min(
            Math.floor((currentProgress / 100) * STAGES.length),
            STAGES.length - 1
          );
          if (newStageIndex !== currentStageIndex) {
            currentStageIndex = newStageIndex;
            setStage(STAGES[currentStageIndex]);
          }

          // Check actual status from backend
          try {
            const statusRes = await getDownloadStatus(response.jobId);
            if (statusRes.success && statusRes.data) {
              const statusData = statusRes.data;
              
              if (statusData.status === 'success') {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setProgress(100);
                setStage('finalizing');
                setResult({
                  jobId: response.jobId,
                  status: 'success',
                  progress: 100,
                  filename: statusData.filename || response.filename,
                  downloadUrl: statusData.downloadUrl,
                  fileSize: statusData.fileSize,
                });
                setIsProcessing(false);
              } else if (statusData.status === 'error') {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setError(statusData.error || 'Something went wrong while processing your file.');
                setIsProcessing(false);
              }
            }
          } catch {
            // Backend not available, simulate completion
          }

          // Simulate completion after demo delay
          if (currentProgress >= 95) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setProgress(100);
            setStage('finalizing');
            setResult({
              jobId: response.jobId,
              status: 'success',
              progress: 100,
              filename: response.filename || `media_clip.${settings.type === 'audio' ? settings.format : 'mp4'}`,
              fileSize: `${(Math.random() * 20 + 5).toFixed(1)} MB`,
            });
            setIsProcessing(false);
          }
        }, 800);
      }
    } catch (err) {
      setError('Something went wrong while processing your file.');
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsProcessing(false);
    setResult(null);
    setProgress(0);
    setStage(null);
    setError(null);
  }, []);

  return { isProcessing, result, progress, stage, error, download, reset };
}
