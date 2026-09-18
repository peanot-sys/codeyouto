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

// Invidious instances (with API support)
const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
  'https://yt.chocolatemoo53.com',
  'https://invidious.tiekoetter.com',
];

// CORS proxies to try
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

// Fetch video info from Invidious via CORS proxy
async function fetchFromInvidious(videoId: string): Promise<any> {
  for (const instance of INVIDIOUS_INSTANCES) {
    for (const proxy of CORS_PROXIES) {
      try {
        const apiUrl = `${instance}/api/v1/videos/${videoId}`;
        const proxiedUrl = `${proxy}${encodeURIComponent(apiUrl)}`;
        
        const response = await fetch(proxiedUrl, {
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.videoId) {
            console.log('Successfully fetched from:', instance, 'via', proxy);
            return { data, instance };
          }
        }
      } catch (error) {
        console.log('Failed:', instance, proxy, error);
        continue;
      }
    }
  }
  throw new Error('Could not fetch video info from any Invidious instance');
}

// Parse Invidious response into our MediaInfo format
function parseInvidiousResponse(data: any, url: string, instance: string): MediaInfo {
  // Extract available qualities from formatStreams
  const videoQualities: VideoQuality[] = [];
  const qualityMap: Record<string, VideoQuality> = {
    '360p': '360p',
    '480p': '480p',
    '720p': '720p',
    '1080p': '1080p',
  };
  
  if (data.formatStreams) {
    data.formatStreams.forEach((stream: any) => {
      const quality = stream.qualityLabel;
      if (qualityMap[quality] && !videoQualities.includes(qualityMap[quality])) {
        videoQualities.push(qualityMap[quality]);
      }
    });
  }
  
  // Sort qualities
  const qualityOrder: VideoQuality[] = ['1080p', '720p', '480p', '360p'];
  videoQualities.sort((a, b) => qualityOrder.indexOf(a) - qualityOrder.indexOf(b));
  
  // If no qualities found, provide defaults
  if (videoQualities.length === 0) {
    videoQualities.push('720p', '480p', '360p');
  }
  
  // Get best thumbnail
  let thumbnail = `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`;
  if (data.videoThumbnails && data.videoThumbnails.length > 0) {
    const maxRes = data.videoThumbnails.find((t: any) => t.quality === 'maxresdefault');
    const highRes = data.videoThumbnails.find((t: any) => t.quality === 'high');
    thumbnail = maxRes?.url || highRes?.url || thumbnail;
  }
  
  return {
    id: data.videoId,
    url,
    platform: 'youtube',
    title: data.title || 'YouTube Video',
    thumbnail,
    duration: data.lengthSeconds || 0,
    creator: data.author,
    availableVideoQualities: videoQualities,
    availableAudioFormats: ['mp3', 'm4a'] as AudioFormat[],
    availableAudioQualities: ['128kbps', '192kbps', '256kbps', '320kbps'] as AudioQuality[],
    // Store the raw data for download
    _rawData: data,
    _instance: instance,
  } as any;
}

export async function analyzeMedia(url: string): Promise<MediaInfo> {
  const platform = detectPlatform(url);
  
  if (platform === 'youtube') {
    const videoId = extractYouTubeId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');
    
    const { data, instance } = await fetchFromInvidious(videoId);
    return parseInvidiousResponse(data, url, instance);
  }
  
  if (platform === 'instagram') {
    const shortcode = extractInstagramShortcode(url);
    if (!shortcode) throw new Error('Invalid Instagram URL');
    
    // Instagram doesn't have a good public API, return basic info
    return {
      id: shortcode,
      url,
      platform: 'instagram',
      title: 'Instagram Reel',
      thumbnail: '',
      duration: 60,
      creator: undefined,
      availableVideoQualities: ['720p', '480p', '360p'] as VideoQuality[],
      availableAudioFormats: ['mp3', 'm4a'] as AudioFormat[],
      availableAudioQualities: ['128kbps', '192kbps', '256kbps', '320kbps'] as AudioQuality[],
    };
  }
  
  throw new Error('Unsupported platform');
}

// Get download URL for a specific quality
export function getDownloadUrl(media: MediaInfo, quality: string, type: 'video' | 'audio'): string | null {
  const rawData = (media as any)._rawData;
  const instance = (media as any)._instance;
  
  if (!rawData || !instance) return null;
  
  if (type === 'video') {
    // Find the stream with matching quality
    const stream = rawData.formatStreams?.find((s: any) => s.qualityLabel === quality);
    if (stream && stream.url) {
      // Proxy the URL through the Invidious instance
      return `${instance}${stream.url}`;
    }
  } else {
    // For audio, find the best audio stream
    const audioStreams = rawData.adaptiveFormats?.filter((s: any) => 
      s.type && s.type.startsWith('audio/')
    );
    
    if (audioStreams && audioStreams.length > 0) {
      // Get the best quality audio
      const bestAudio = audioStreams.sort((a: any, b: any) => 
        parseInt(b.bitrate || 0) - parseInt(a.bitrate || 0)
      )[0];
      
      if (bestAudio && bestAudio.url) {
        return `${instance}${bestAudio.url}`;
      }
    }
  }
  
  return null;
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
