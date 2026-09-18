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
import { useMediaInfo } from './hooks/useMediaInfo';
import { useDownload } from './hooks/useDownload';
import { MediaType, VideoQuality, AudioFormat, AudioQuality, DownloadSettings } from './types/media';
import { Eye, EyeOff } from 'lucide-react';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { status, mediaInfo, error: mediaError, analyze, reset: resetMedia } = useMediaInfo();
  const { isProcessing, result, progress, stage, error: downloadError, download, reset: resetDownload } = useDownload();

  // Media settings state
  const [mediaType, setMediaType] = useState<MediaType>('video');
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('720p');
  const [audioFormat, setAudioFormat] = useState<AudioFormat>('mp3');
  const [audioQuality, setAudioQuality] = useState<AudioQuality>('192kbps');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [previewOnly, setPreviewOnly] = useState(false);

  const handleAnalyze = useCallback(async (url: string) => {
    await analyze(url);
  }, [analyze]);

  // Initialize end time when media loads
  if (mediaInfo && endTime === 0 && mediaInfo.duration > 0) {
    setEndTime(mediaInfo.duration);
  }

  const handleDownload = useCallback(async () => {
    if (!mediaInfo) return;

    const settings: DownloadSettings = {
      type: mediaType,
      format: mediaType === 'video' ? 'mp4' : audioFormat,
      quality: mediaType === 'video' ? videoQuality : audioQuality.replace('kbps', ''),
      startTime,
      endTime,
    };

    await download(mediaInfo, settings);
  }, [mediaInfo, mediaType, audioFormat, videoQuality, audioQuality, startTime, endTime, download]);

  const handleDownloadFile = useCallback(() => {
    if (result?.downloadUrl) {
      // Open download URL in new tab
      window.open(result.downloadUrl, '_blank');
    }
  }, [result]);

  const handleStartOver = useCallback(() => {
    resetMedia();
    resetDownload();
    setMediaType('video');
    setStartTime(0);
    setEndTime(0);
    setPreviewOnly(false);
  }, [resetMedia, resetDownload]);

  const handleRetry = useCallback(() => {
    resetDownload();
    if (mediaInfo) {
      analyze(mediaInfo.url);
    }
  }, [resetDownload, mediaInfo, analyze]);

  const showError = (status === 'error' && mediaError) || downloadError;

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
              error={status === 'error' ? mediaError : null}
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
                qualities={mediaInfo.availableAudioQualities.map(q => `${q}kbps`) as any}
                selectedFormat={audioFormat}
                selectedQuality={audioQuality}
                onFormatChange={setAudioFormat}
                onQualityChange={(q) => setAudioQuality(q as any)}
              />
            )}

            {/* Timeline editor */}
            <TimelineEditor
              duration={mediaInfo.duration || 300}
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

            {/* Media preview */}
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
                quality: mediaType === 'video' ? videoQuality : audioQuality.replace('kbps', ''),
                startTime,
                endTime,
              }}
              onDownload={handleDownload}
              isProcessing={isProcessing}
            />

            {/* Info notice */}
            <div className="glass-card-sm p-4 text-center animate-fade-in">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                💡 Real media processing powered by FFmpeg backend.
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
              error={downloadError || mediaError || 'An error occurred'}
              onRetry={mediaInfo ? handleRetry : undefined}
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
