import { MediaInfo, Platform, VideoQuality, AudioFormat, AudioQuality } from '../types/media';
import { detectPlatform } from '../utils/platform';
import { api } from './api';

// Extract YouTube video ID from various URL formats
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Extract Instagram shortcode from URL
export function extractInstagramShortcode(url: string): string | null {
  const patterns = [
    /instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Analyze media using backend API
export async function analyzeMedia(url: string): Promise<MediaInfo> {
  const response = await api.analyze(url);
  
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to analyze media');
  }

  const data = response.data;
  const platform = detectPlatform(url);
  
  if (!platform) {
    throw new Error('Unsupported platform');
  }

  return {
    id: extractYouTubeId(url) || extractInstagramShortcode(url) || Math.random().toString(36).slice(2),
    url,
    platform,
    title: data.title || 'Untitled',
    thumbnail: data.thumbnail || '',
    duration: data.duration || 0,
    creator: data.creator,
    availableVideoQualities: (data.videoQualities || ['720p', '480p', '360p']) as VideoQuality[],
    availableAudioFormats: (data.audioFormats || []) as AudioFormat[],
    availableAudioQualities: (data.audioQualities || []) as AudioQuality[],
  };
}

// Start download job
export async function startDownload(settings: {
  url: string;
  type: string;
  format?: string;
  quality?: string;
  startTime?: number;
  endTime?: number;
}) {
  const response = await api.download(settings);
  
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to start download');
  }

  return response.data;
}

// Get download status
export async function getDownloadStatus(jobId: string) {
  const response = await api.getStatus(jobId);
  return response;
}

// Get YouTube embed URL with start/end parameters
export function getYouTubeEmbedUrl(videoId: string, startTime?: number, endTime?: number): string {
  let url = `https://www.youtube.com/embed/${videoId}`;
  const params: string[] = [];
  
  if (startTime !== undefined && startTime > 0) {
    params.push(`start=${Math.floor(startTime)}`);
  }
  if (endTime !== undefined && endTime > 0) {
    params.push(`end=${Math.floor(endTime)}`);
  }
  
  if (params.length > 0) {
    url += '?' + params.join('&');
  }
  
  return url;
}

// Get Instagram embed URL
export function getInstagramEmbedUrl(shortcode: string): string {
  return `https://www.instagram.com/reel/${shortcode}/embed`;
}
