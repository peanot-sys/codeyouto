import { useState, useRef } from 'react';
import { MediaInfo } from '../types/media';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface MediaPreviewProps {
  media: MediaInfo;
  startTime: number;
  endTime: number;
  previewOnly: boolean;
}

export function MediaPreview({ media, startTime, endTime, previewOnly }: MediaPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        if (previewOnly) {
          videoRef.current.currentTime = startTime;
        }
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      
      if (previewOnly && time >= endTime) {
        videoRef.current.pause();
        videoRef.current.currentTime = startTime;
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen?.();
    }
  };

  return (
    <div className="glass-card overflow-hidden animate-fade-in-up">
      {/* Video */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={media.thumbnail}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          playsInline
        />
        
        {/* Play overlay */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
            aria-label="Play"
          >
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play size={24} className="text-gray-900 ml-1" fill="currentColor" />
            </div>
          </button>
        )}

        {/* Preview badge */}
        {previewOnly && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/90 text-white backdrop-blur-sm">
            Preview Selection
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-3 sm:p-4 space-y-3">
        {/* Progress bar */}
        <div className="relative">
          <input
            type="range"
            min={0}
            max={media.duration}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #6366f1 ${(currentTime / media.duration) * 100}%, var(--border-color) ${(currentTime / media.duration) * 100}%)`,
            }}
            aria-label="Seek"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)' }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={toggleMute}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)' }}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
              {formatSimpleTime(currentTime)} / {formatSimpleTime(media.duration)}
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)' }}
            aria-label="Fullscreen"
          >
            <Maximize size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function formatSimpleTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
