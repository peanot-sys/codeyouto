import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { UrlInput } from './components/UrlInput';
import { MediaCard, MediaCardSkeleton } from './components/MediaCard';
import { MediaTypeSelector } from './components/MediaTypeSelector';
import { VideoOptions } from './components/VideoOptions';
import { AudioOptions } from './components/AudioOptions';
import { TimelineEditor } from './components/TimelineEditor';
import { MediaPreview } from './components/MediaPreview';
import { DownloadSummary } from './components/DownloadSummary';
import { ProcessingState } from './components/ProcessingState';
import { SuccessState } from './components/SuccessState';
import { ErrorState } from './components/ErrorState';
import { Footer } from './components/Footer';
import { useTheme } from './hooks/useTheme';
import { useDownload } from './hooks/useDownload';
import { MediaType, VideoQuality, AudioFormat, AudioQuality, DownloadSettings, MediaInfo, AppStatus } from './types/media';
import { analyzeMedia } from './services/mediaService';
import { validateUrl } from './utils/validation';
import { Eye, EyeOff } from 'lucide-react';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { isProcessing, result, progress, stage, error: downloadError, download, reset: resetDownload } = useDownload();

  // App state
  const [status, setStatus] = useState<AppStatus>('idle');
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUrl, setLastUrl] = useState('');

  // Media settings state
  const [mediaType, setMediaType] = useState<MediaType>('video');
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('720p');
  const [audioFormat, setAudioFormat] = useState<AudioFormat>('mp3');
  const [audioQuality, setAudioQuality] = useState<AudioQuality>('192kbps');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [previewOnly, setPreviewOnly] = useState(false);
  const [duration, setDuration] = useState(300); // Default 5 minutes if unknown

  const handleAnalyze = useCallback(async (url: string) => {
    const validation = validateUrl(url);
    if (!validation.valid) {
      setError(validation.error || 'Invalid URL');
      setStatus('error');
      return;
    }

    setLastUrl(url);
    setStatus('analyzing');
    setError(null);
    setMediaInfo(null);

    try {
      const info = await analyzeMedia(url);
      setMediaInfo(info);
      
      // Set duration - if unknown (0), use default
      const mediaDuration = info.duration > 0 ? info.duration : 300;
      setDuration(mediaDuration);
      setStartTime(0);
      setEndTime(mediaDuration);
      
      setStatus('media-loaded');
    } catch (err) {
      setError('This media could not be accessed. Please check the URL and try again.');
      setStatus('error');
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!mediaInfo) return;

    const settings: DownloadSettings = {
      type: mediaType,
      format: mediaType === 'video' ? 'mp4' : audioFormat,
      quality: mediaType === 'video' ? videoQuality : audioQuality,
      startTime,
      endTime,
    };

    await download(mediaInfo, settings);
  }, [mediaInfo, mediaType, audioFormat, videoQuality, audioQuality, startTime, endTime, download]);

  const handleDownloadFile = useCallback(() => {
    if (result?.downloadUrl) {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.filename || 'video.mp4';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [result]);

  const handleStartOver = useCallback(() => {
    setStatus('idle');
    setMediaInfo(null);
    setError(null);
    resetDownload();
    setMediaType('video');
    setStartTime(0);
    setEndTime(0);
    setPreviewOnly(false);
    setLastUrl('');
    setDuration(300);
  }, [resetDownload]);

  const handleRetry = useCallback(() => {
    if (lastUrl) {
      resetDownload();
      handleAnalyze(lastUrl);
    }
  }, [lastUrl, resetDownload, handleAnalyze]);

  const showError = (status === 'error' && error) || downloadError;

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background blobs */}
      <div className="bg-blobs">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
      </div>

      {/* Header */}
      <Header theme={theme} onToggleTheme={toggleTheme} />

      {/* Main content */}
      <main className="flex-1 relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero */}
        {(status === 'idle' || status === 'analyzing') && !mediaInfo && (
          <div className="text-center mb-8 sm:mb-10 animate-fade-in-up">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Download only what you need.
            </h1>
            <p
              className="text-base sm:text-lg max-w-lg mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Paste a video link, choose video or audio, select the exact part, and download.
            </p>
          </div>
        )}

        {/* URL Input */}
        {!result && (
          <div className="mb-8">
            <UrlInput
              onAnalyze={handleAnalyze}
              isAnalyzing={status === 'analyzing'}
              error={status === 'error' ? error : null}
            />
          </div>
        )}

        {/* Loading skeleton */}
        {status === 'analyzing' && !mediaInfo && (
          <div className="space-y-6">
            <MediaCardSkeleton />
          </div>
        )}

        {/* Media card and options */}
        {mediaInfo && !isProcessing && !result && (
          <div className="space-y-6">
            <MediaCard media={mediaInfo} />

            {/* Duration notice for YouTube */}
            {mediaInfo.platform === 'youtube' && mediaInfo.duration === 0 && (
              <div className="glass-card-sm p-3 flex items-center gap-2 text-sm animate-fade-in" style={{ color: 'var(--text-secondary)' }}>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Duration not available. Default set to 5 minutes. Adjust the timeline as needed.
              </div>
            )}

            {/* Media type selector */}
            <MediaTypeSelector selected={mediaType} onChange={setMediaType} />

            {/* Quality options */}
            {mediaType === 'video' ? (
              <VideoOptions
                qualities={mediaInfo.availableVideoQualities}
                selected={videoQuality}
                onChange={setVideoQuality}
              />
            ) : (
              <AudioOptions
                formats={mediaInfo.availableAudioFormats}
                qualities={mediaInfo.availableAudioQualities}
                selectedFormat={audioFormat}
                selectedQuality={audioQuality}
                onFormatChange={setAudioFormat}
                onQualityChange={setAudioQuality}
              />
            )}

            {/* Timeline editor */}
            <TimelineEditor
              duration={duration}
              startTime={startTime}
              endTime={endTime}
              onStartChange={setStartTime}
              onEndChange={setEndTime}
            />

            {/* Preview toggle */}
            <div className="flex items-center justify-between glass-card-sm p-4">
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Preview Selected Part
              </span>
              <button
                onClick={() => setPreviewOnly(!previewOnly)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: previewOnly ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-glass)',
                  color: previewOnly ? '#6366f1' : 'var(--text-secondary)',
                  border: `1px solid ${previewOnly ? 'rgba(99, 102, 241, 0.2)' : 'var(--border-color)'}`,
                }}
              >
                {previewOnly ? <Eye size={16} /> : <EyeOff size={16} />}
                {previewOnly ? 'On' : 'Off'}
              </button>
            </div>

            {/* Media preview - real embed */}
            <MediaPreview
              media={mediaInfo}
              startTime={startTime}
              endTime={endTime}
              previewOnly={previewOnly}
            />

            {/* Download summary */}
            <DownloadSummary
              media={mediaInfo}
              settings={{
                type: mediaType,
                format: mediaType === 'video' ? 'mp4' : audioFormat,
                quality: mediaType === 'video' ? videoQuality : audioQuality,
                startTime,
                endTime,
              }}
              onDownload={handleDownload}
              isProcessing={isProcessing}
            />

            {/* Info notice */}
            <div className="glass-card-sm p-4 text-center animate-fade-in">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                💡 Powered by Invidious. Supports YouTube videos, shorts, and music.
              </p>
            </div>
          </div>
        )}

        {/* Processing state */}
        {isProcessing && (
          <ProcessingState progress={progress} stage={stage} />
        )}

        {/* Success state */}
        {result && result.status === 'success' && (
          <SuccessState
            result={result}
            onDownloadFile={handleDownloadFile}
            onDownloadAnother={handleStartOver}
          />
        )}

        {/* Error state */}
        {showError && !isProcessing && (
          <div className="mt-6">
            <ErrorState
              error={downloadError || error || 'An error occurred'}
              onRetry={lastUrl ? handleRetry : undefined}
              onStartOver={handleStartOver}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
