import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export interface MediaMetadata {
  platform: 'youtube' | 'instagram';
  title: string;
  thumbnail: string;
  duration: number;
  videoQualities: string[];
  audioFormats: string[];
  audioQualities: string[];
  author?: string;
}

export interface StreamInfo {
  videoPath?: string;
  audioPath?: string;
  hasAudio: boolean;
  hasVideo: boolean;
}

// Detect platform from URL
function detectPlatform(url: string): 'youtube' | 'instagram' | null {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/instagram\.com/.test(url)) return 'instagram';
  return null;
}

// Get yt-dlp binary path
function getYtDlpPath(): string {
  // Check if yt-dlp is in PATH
  const customPath = process.env.YT_DLP_PATH;
  if (customPath && fs.existsSync(customPath)) {
    return customPath;
  }
  
  // Check local binary
  const localPath = path.join(__dirname, '../../bin/yt-dlp');
  if (fs.existsSync(localPath)) {
    return localPath;
  }
  
  // Fallback to system yt-dlp
  return 'yt-dlp';
}

// Run yt-dlp command
function runYtDlp(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const ytDlpPath = getYtDlpPath();
    const proc = spawn(ytDlpPath, args, {
      timeout: 60000,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`yt-dlp failed with code ${code}: ${stderr}`));
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to start yt-dlp: ${err.message}`));
    });
  });
}

// Get media metadata
export async function getMediaMetadata(url: string): Promise<MediaMetadata> {
  const platform = detectPlatform(url);
  if (!platform) {
    throw new Error('Unsupported platform. Only YouTube and Instagram are supported.');
  }

  try {
    // Get JSON metadata using yt-dlp
    const args = [
      '--dump-json',
      '--no-download',
      '--no-playlist',
      url
    ];

    const output = await runYtDlp(args);
    const data = JSON.parse(output);

    // Extract available video qualities
    const videoQualities: string[] = [];
    const seen = new Set<string>();
    
    if (data.formats) {
      for (const format of data.formats) {
        if (format.height && format.vcodec !== 'none') {
          const quality = `${format.height}p`;
          if (!seen.has(quality) && ['360p', '480p', '720p', '1080p'].includes(quality)) {
            seen.add(quality);
            videoQualities.push(quality);
          }
        }
      }
    }

    // Sort qualities
    videoQualities.sort((a, b) => {
      const order = ['1080p', '720p', '480p', '360p'];
      return order.indexOf(a) - order.indexOf(b);
    });

    // Check if audio is available
    const hasAudio = data.formats?.some((f: any) => f.acodec !== 'none');
    
    const audioFormats = hasAudio ? ['mp3', 'm4a'] : [];
    const audioQualities = hasAudio ? ['128', '192', '256', '320'] : [];

    // Get best thumbnail
    let thumbnail = '';
    if (data.thumbnail) {
      thumbnail = data.thumbnail;
    } else if (data.thumbnails && data.thumbnails.length > 0) {
      const best = data.thumbnails[data.thumbnails.length - 1];
      thumbnail = best.url || '';
    }

    return {
      platform,
      title: data.title || 'Untitled',
      thumbnail,
      duration: Math.floor(data.duration || 0),
      videoQualities: videoQualities.length > 0 ? videoQualities : ['720p', '480p', '360p'],
      audioFormats,
      audioQualities,
      author: data.uploader || data.channel || data.creator,
    };
  } catch (error: any) {
    console.error('Error fetching metadata:', error);
    throw new Error(`Failed to fetch media information: ${error.message}`);
  }
}

// Download media streams
export async function downloadMedia(
  url: string,
  jobId: string,
  quality?: string,
  type: 'video' | 'audio' = 'video'
): Promise<StreamInfo> {
  const jobDir = path.join(process.env.TEMP_DIR || './temp', jobId);
  if (!fs.existsSync(jobDir)) {
    fs.mkdirSync(jobDir, { recursive: true });
  }

  const result: StreamInfo = {
    hasAudio: false,
    hasVideo: false,
  };

  try {
    if (type === 'audio') {
      // Download best audio only
      const audioPath = path.join(jobDir, 'audio_input.%(ext)s');
      const args = [
        '-f', 'bestaudio[ext=m4a]/bestaudio',
        '--extract-audio',
        '--audio-format', 'wav', // Download as WAV for easier processing
        '-o', audioPath,
        '--no-playlist',
        url
      ];

      await runYtDlp(args);
      
      // Find the downloaded file
      const files = fs.readdirSync(jobDir);
      const audioFile = files.find(f => f.startsWith('audio_input'));
      if (audioFile) {
        result.audioPath = path.join(jobDir, audioFile);
        result.hasAudio = true;
      }
    } else {
      // Download video + audio
      const videoPath = path.join(jobDir, 'video_input.%(ext)s');
      
      // Try to get video with audio first
      let formatSelector = 'bestvideo[height<=' + (quality?.replace('p', '') || '720') + ']+bestaudio/best[height<=' + (quality?.replace('p', '') || '720') + ']';
      
      const args = [
        '-f', formatSelector,
        '--merge-output-format', 'mp4',
        '-o', videoPath,
        '--no-playlist',
        url
      ];

      await runYtDlp(args);
      
      // Find the downloaded file
      const files = fs.readdirSync(jobDir);
      const videoFile = files.find(f => f.startsWith('video_input'));
      if (videoFile) {
        result.videoPath = path.join(jobDir, videoFile);
        result.hasVideo = true;
        result.hasAudio = true; // Merged format has audio
      }
    }

    if (!result.videoPath && !result.audioPath) {
      throw new Error('Failed to download media streams');
    }

    return result;
  } catch (error: any) {
    console.error('Error downloading media:', error);
    throw new Error(`Failed to download media: ${error.message}`);
  }
}
