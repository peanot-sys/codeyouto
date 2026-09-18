import { Platform } from '../types/media';

export function detectPlatform(url: string): Platform | null {
  const trimmed = url.trim().toLowerCase();
  
  if (
    trimmed.includes('youtube.com') ||
    trimmed.includes('youtu.be') ||
    trimmed.includes('youtube.com/shorts')
  ) {
    return 'youtube';
  }
  
  if (
    trimmed.includes('instagram.com') ||
    trimmed.includes('instagr.am')
  ) {
    return 'instagram';
  }
  
  return null;
}

export function isShortUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  return trimmed.includes('youtube.com/shorts') || trimmed.includes('instagram.com/reel');
}

export function getPlatformLabel(platform: Platform): string {
  switch (platform) {
    case 'youtube':
      return 'YouTube';
    case 'instagram':
      return 'Instagram Reel';
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
