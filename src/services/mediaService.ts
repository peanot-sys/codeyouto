import { MediaInfo, Platform, VideoQuality, AudioFormat, AudioQuality } from '../types/media';
import { detectPlatform } from '../utils/platform';

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

// Fetch YouTube video info via oEmbed (no API key needed, CORS-friendly)
async function fetchYouTubeInfo(videoId: string, url: string): Promise<MediaInfo> {
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  
  try {
    const response = await fetch(oembedUrl);
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    
    return {
      id: videoId,
      url,
      platform: 'youtube',
      title: data.title || 'YouTube Video',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: 0, // oEmbed doesn't provide duration, we'll handle this
      creator: data.author_name || data.author_url?.split('/').pop(),
      availableVideoQualities: ['360p', '480p', '720p', '1080p'] as VideoQuality[],
      availableAudioFormats: ['mp3', 'm4a'] as AudioFormat[],
      availableAudioQualities: ['128kbps', '192kbps', '256kbps', '320kbps'] as AudioQuality[],
    };
  } catch (error) {
    // Fallback if oEmbed fails
    return {
      id: videoId,
      url,
      platform: 'youtube',
      title: 'YouTube Video',
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration: 0,
      creator: undefined,
      availableVideoQualities: ['360p', '480p', '720p', '1080p'] as VideoQuality[],
      availableAudioFormats: ['mp3', 'm4a'] as AudioFormat[],
      availableAudioQualities: ['128kbps', '192kbps', '256kbps', '320kbps'] as AudioQuality[],
    };
  }
}

// Fetch Instagram info (limited without API)
function fetchInstagramInfo(shortcode: string, url: string): MediaInfo {
  return {
    id: shortcode,
    url,
    platform: 'instagram',
    title: 'Instagram Reel',
    thumbnail: '',
    duration: 60, // Default estimate
    creator: undefined,
    availableVideoQualities: ['360p', '480p', '720p'] as VideoQuality[],
    availableAudioFormats: ['mp3', 'm4a'] as AudioFormat[],
    availableAudioQualities: ['128kbps', '192kbps', '256kbps', '320kbps'] as AudioQuality[],
  };
}

export async function analyzeMedia(url: string): Promise<MediaInfo> {
  const platform = detectPlatform(url);
  
  if (platform === 'youtube') {
    const videoId = extractYouTubeId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');
    return fetchYouTubeInfo(videoId, url);
  }
  
  if (platform === 'instagram') {
    const shortcode = extractInstagramShortcode(url);
    if (!shortcode) throw new Error('Invalid Instagram URL');
    return fetchInstagramInfo(shortcode, url);
  }
  
  throw new Error('Unsupported platform');
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

// Download functions (require backend for actual processing)
export async function startDownload(settings: {
  url: string;
  type: string;
  format: string;
  quality: string;
  startTime: number;
  endTime: number;
}) {
  const API_URL = import.meta.env.VITE_API_URL || '';
  
  if (API_URL) {
    try {
      const response = await fetch(`${API_URL}/api/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        return response.json();
      }
    } catch (e) {
      // Fall through to demo
    }
  }
  
  // Demo mode - simulate processing
  const jobId = Math.random().toString(36).slice(2);
  return {
    jobId,
    status: 'processing',
    filename: `media_clip_${Date.now()}.${settings.type === 'audio' ? settings.format : 'mp4'}`,
  };
}

export async function getDownloadStatus(jobId: string) {
  const API_URL = import.meta.env.VITE_API_URL || '';
  
  if (API_URL) {
    try {
      const response = await fetch(`${API_URL}/api/status/${jobId}`);
      if (response.ok) {
        return { success: true, data: await response.json() };
      }
    } catch (e) {
      // Fall through
    }
  }
  
  return { success: false, data: null };
}
