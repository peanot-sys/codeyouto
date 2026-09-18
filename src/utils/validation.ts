import { Platform } from '../types/media';
import { detectPlatform } from './platform';

export function validateUrl(url: string): { valid: boolean; error?: string } {
  const trimmed = url.trim();
  
  if (!trimmed) {
    return { valid: false, error: 'Please enter a URL' };
  }
  
  // Basic URL format check
  if (!trimmed.includes('.') || (!trimmed.includes('http') && !trimmed.includes('://'))) {
    // Allow pasting just video IDs or partial URLs
    if (trimmed.match(/^[a-zA-Z0-9_-]{11}$/)) {
      // Looks like a YouTube video ID
      return { valid: true };
    }
    return { valid: false, error: 'Please enter a valid YouTube or Instagram URL.' };
  }
  
  const platform = detectPlatform(trimmed);
  if (!platform) {
    return { valid: false, error: 'This URL is not supported. Please use a YouTube or Instagram link.' };
  }
  
  return { valid: true };
}

export function isValidUrl(url: string): boolean {
  return validateUrl(url).valid;
}

export function getValidationError(url: string): string | null {
  const result = validateUrl(url);
  return result.valid ? null : (result.error || null);
}

export function validateTimeRange(start: number, end: number, maxDuration: number): { valid: boolean; error?: string } {
  if (start < 0) return { valid: false, error: 'Start time cannot be negative' };
  if (end > maxDuration) return { valid: false, error: 'End time exceeds video duration' };
  if (start >= end) return { valid: false, error: 'Start time must be before end time' };
  return { valid: true };
}
