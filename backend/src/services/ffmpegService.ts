import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import path from 'path';
import fs from 'fs';

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath.path);

export interface FfmpegOptions {
  inputPath: string;
  outputPath: string;
  startTime?: number;
  endTime?: number;
  quality?: string;
  format?: string;
  type: 'video' | 'audio';
}

// Extract audio to MP3
export async function extractAudioToMp3(options: FfmpegOptions): Promise<void> {
  const { inputPath, outputPath, startTime, endTime, quality } = options;
  
  const bitrate = quality ? `${quality}k` : '192k';
  
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate(bitrate)
      .output(outputPath)
      .outputOptions(['-map_metadata', '-1']); // Remove metadata for cleaner output

    if (startTime !== undefined) {
      command = command.setStartTime(startTime);
    }
    
    if (endTime !== undefined && startTime !== undefined) {
      const duration = endTime - startTime;
      command = command.setDuration(duration);
    }

    command
      .on('end', () => {
        console.log(`✅ MP3 extraction complete: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`❌ MP3 extraction failed:`, err);
        reject(new Error(`FFmpeg MP3 extraction failed: ${err.message}`));
      })
      .run();
  });
}

// Extract audio to M4A
export async function extractAudioToM4a(options: FfmpegOptions): Promise<void> {
  const { inputPath, outputPath, startTime, endTime, quality } = options;
  
  const bitrate = quality ? `${quality}k` : '192k';
  
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath)
      .noVideo()
      .audioCodec('aac')
      .audioBitrate(bitrate)
      .outputOptions([
        '-movflags', '+faststart',
        '-map_metadata', '-1'
      ])
      .output(outputPath);

    if (startTime !== undefined) {
      command = command.setStartTime(startTime);
    }
    
    if (endTime !== undefined && startTime !== undefined) {
      const duration = endTime - startTime;
      command = command.setDuration(duration);
    }

    command
      .on('end', () => {
        console.log(`✅ M4A extraction complete: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`❌ M4A extraction failed:`, err);
        reject(new Error(`FFmpeg M4A extraction failed: ${err.message}`));
      })
      .run();
  });
}

// Trim video (with audio)
export async function trimVideo(options: FfmpegOptions): Promise<void> {
  const { inputPath, outputPath, startTime, endTime, quality } = options;
  
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath)
      .outputOptions(['-map_metadata', '-1']);

    if (startTime !== undefined) {
      command = command.setStartTime(startTime);
    }
    
    if (endTime !== undefined && startTime !== undefined) {
      const duration = endTime - startTime;
      command = command.setDuration(duration);
    }

    // If quality is specified, re-encode; otherwise copy streams
    if (quality && quality !== 'original') {
      const height = parseInt(quality.replace('p', ''));
      command = command
        .videoCodec('libx264')
        .audioCodec('aac')
        .size(`${height}p`)
        .outputOptions([
          '-preset', 'fast',
          '-crf', '23'
        ]);
    } else {
      command = command
        .videoCodec('copy')
        .audioCodec('copy');
    }

    command
      .output(outputPath)
      .on('end', () => {
        console.log(`✅ Video trim complete: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`❌ Video trim failed:`, err);
        reject(new Error(`FFmpeg video trim failed: ${err.message}`));
      })
      .run();
  });
}

// Trim audio only
export async function trimAudio(options: FfmpegOptions): Promise<void> {
  const { inputPath, outputPath, startTime, endTime } = options;
  
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath)
      .noVideo()
      .audioCodec('copy')
      .outputOptions(['-map_metadata', '-1'])
      .output(outputPath);

    if (startTime !== undefined) {
      command = command.setStartTime(startTime);
    }
    
    if (endTime !== undefined && startTime !== undefined) {
      const duration = endTime - startTime;
      command = command.setDuration(duration);
    }

    command
      .on('end', () => {
        console.log(`✅ Audio trim complete: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`❌ Audio trim failed:`, err);
        reject(new Error(`FFmpeg audio trim failed: ${err.message}`));
      })
      .run();
  });
}

// Validate output file
export function validateOutput(filePath: string, expectedType: 'video' | 'audio', expectedFormat?: string): boolean {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Output file does not exist: ${filePath}`);
    return false;
  }

  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    console.error(`❌ Output file is empty: ${filePath}`);
    return false;
  }

  // Check extension
  const ext = path.extname(filePath).toLowerCase();
  if (expectedFormat) {
    const expectedExt = `.${expectedFormat.toLowerCase()}`;
    if (ext !== expectedExt) {
      console.error(`❌ Wrong extension. Expected ${expectedExt}, got ${ext}`);
      return false;
    }
  }

  // Check MIME type via extension
  const validExtensions: Record<string, string[]> = {
    'video': ['.mp4', '.webm', '.mkv'],
    'audio': ['.mp3', '.m4a', '.wav', '.ogg'],
  };

  if (!validExtensions[expectedType]?.includes(ext)) {
    console.error(`❌ Invalid extension for ${expectedType}: ${ext}`);
    return false;
  }

  console.log(`✅ Output validation passed: ${filePath} (${stats.size} bytes)`);
  return true;
}

// Get file MIME type
export function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.m4a': 'audio/mp4',
    '.mp4': 'video/mp4',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.webm': 'video/webm',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
