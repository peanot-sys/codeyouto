import { MediaInfo, Platform } from '../types/media';
import { detectPlatform } from '../utils/platform';
import { api } from './api';

// Demo media info for when backend is not available
function generateDemoMediaInfo(url: string): MediaInfo {
  const platform = detectPlatform(url) || 'youtube';
  const isInstagram = platform === 'instagram';
  
  return {
    id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
    url,
    platform,
    title: isInstagram
      ? 'Instagram Reel - Beautiful Sunset Timelapse'
      : 'Amazing Nature Documentary - 4K Ultra HD',
    thumbnail: isInstagram
      ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop'
      : 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=640&h=360&fit=crop',
    duration: isInstagram ? 45 : 632,
    creator: isInstagram ? '@naturelover' : 'Nature Channel',
    availableVideoQualities: isInstagram ? ['360p', '480p', '720p'] : ['360p', '480p', '720p', '1080p'],
    availableAudioFormats: ['mp3', 'm4a'],
    availableAudioQualities: ['128kbps', '192kbps', '256kbps', '320kbps'],
  };
}

export async function analyzeMedia(url: string): Promise<MediaInfo> {
  // Try backend first
  const response = await api.analyze(url);
  
  if (response.success && response.data) {
    return response.data as MediaInfo;
  }
  
  // Fallback to demo data if backend is not available
  console.log('Backend not available, using demo data');
  return generateDemoMediaInfo(url);
}

export async function getDownloadStatus(jobId: string) {
  return api.getStatus(jobId);
}

export async function startDownload(settings: {
  url: string;
  type: string;
  format: string;
  quality: string;
  startTime: number;
  endTime: number;
}) {
  const response = await api.download(settings);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  // Simulate download for demo purposes
  return simulateDownload(settings);
}

async function simulateDownload(settings: any) {
  const jobId = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
  
  // Return a simulated job
  return {
    jobId,
    status: 'processing',
    filename: `media_clip_${Date.now()}.${settings.type === 'audio' ? settings.format : 'mp4'}`,
  };
}
