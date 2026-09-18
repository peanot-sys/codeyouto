export type Platform = 'youtube' | 'instagram';

export type MediaType = 'video' | 'audio';

export type VideoQuality = '360p' | '480p' | '720p' | '1080p';

export type AudioFormat = 'mp3' | 'm4a';

export type AudioQuality = '128kbps' | '192kbps' | '256kbps' | '320kbps';

export type AppStatus =
  | 'idle'
  | 'analyzing'
  | 'media-loaded'
  | 'video-selected'
  | 'audio-selected'
  | 'editing'
  | 'previewing'
  | 'ready'
  | 'processing'
  | 'success'
  | 'error';

export type ProcessingStage =
  | 'preparing'
  | 'processing'
  | 'trimming'
  | 'converting'
  | 'finalizing';

export interface MediaInfo {
  id: string;
  url: string;
  platform: Platform;
  title: string;
  thumbnail: string;
  duration: number; // in seconds
  creator?: string;
  availableVideoQualities: VideoQuality[];
  availableAudioFormats: AudioFormat[];
  availableAudioQualities: AudioQuality[];
}

export interface DownloadSettings {
  type: MediaType;
  format: string;
  quality: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
}

export interface DownloadResult {
  jobId: string;
  status: 'processing' | 'success' | 'error';
  progress?: number;
  stage?: ProcessingStage;
  filename?: string;
  downloadUrl?: string;
  fileSize?: string;
  error?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}
