import { Platform } from '../types/media';

export function detectPlatform(url: string): Platform | null {
  const trimmed = url.trim().toLowerCase();
  
  // YouTube patterns
  if (
    trimmed.includes('youtube.com/watch') ||
    trimmed.includes('youtube.com/shorts') ||
    trimmed.includes('youtu.be/') ||
    trimmed.includes('youtube.com/embed/') ||
    trimmed.includes('youtube.com/v/') ||
    trimmed.includes('m.youtube.com') ||
    trimmed.includes('www.youtube.com')
  ) {
    return 'youtube';
  }
  
  // Instagram patterns
  if (
    trimmed.includes('instagram.com/p/') ||
    trimmed.includes('instagram.com/reel/') ||
    trimmed.includes('instagram.com/reels/') ||
    trimmed.includes('instagram.com/tv/') ||
    trimmed.includes('instagr.am/')
  ) {
    return 'instagram';
  }
  
  return null;
}

export function isShortUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  return trimmed.includes('youtube.com/shorts') || 
         trimmed.includes('instagram.com/reel') ||
         trimmed.includes('instagram.com/reels');
}

export function getPlatformLabel(platform: Platform): string {
  switch (platform) {
    case 'youtube':
      return 'YouTube';
    case 'instagram':
      return 'Instagram';
    default:
      return 'Unknown';
  }
}

export function getPlatformIcon(platform: Platform): string {
  switch (platform) {
    case 'youtube':
      return '▶';
    case 'instagram':
      return '◎';
    default:
      return '?';
  }
}
