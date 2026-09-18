import { Request, Response } from 'express';
import { createJob, processJob, getOutputPathByFileId } from '../services/jobService';
import { getMimeType } from '../services/ffmpegService';
import path from 'path';
import fs from 'fs';

export async function downloadController(req: Request, res: Response): Promise<void> {
  try {
    const { url, type, format, quality, startTime, endTime } = req.body;

    // Validate required fields
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    if (!type || !['video', 'audio'].includes(type)) {
      res.status(400).json({ error: 'Type must be "video" or "audio"' });
      return;
    }

    // Validate format for audio
    if (type === 'audio') {
      if (!format || !['mp3', 'm4a'].includes(format)) {
        res.status(400).json({ error: 'Format must be "mp3" or "m4a" for audio' });
        return;
      }
    }

    // Validate quality
    if (type === 'audio' && quality) {
      const validQualities = ['128', '192', '256', '320'];
      if (!validQualities.includes(quality)) {
        res.status(400).json({ error: 'Invalid audio quality' });
        return;
      }
    }

    if (type === 'video' && quality) {
      const validQualities = ['360p', '480p', '720p', '1080p'];
      if (!validQualities.includes(quality)) {
        res.status(400).json({ error: 'Invalid video quality' });
        return;
      }
    }

    // Validate time range
    if (startTime !== undefined && endTime !== undefined) {
      if (typeof startTime !== 'number' || typeof endTime !== 'number') {
        res.status(400).json({ error: 'Start time and end time must be numbers' });
        return;
      }
      if (startTime < 0) {
        res.status(400).json({ error: 'Start time cannot be negative' });
        return;
      }
      if (endTime <= startTime) {
        res.status(400).json({ error: 'End time must be greater than start time' });
        return;
      }
      const maxDuration = parseInt(process.env.MAX_DURATION || '600');
      if (endTime - startTime > maxDuration) {
        res.status(400).json({ error: `Selection duration exceeds maximum of ${maxDuration} seconds` });
        return;
      }
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      res.status(400).json({ error: 'Invalid URL format' });
      return;
    }

    // Check supported platforms
    if (!/youtube\.com|youtu\.be|instagram\.com/.test(url)) {
      res.status(400).json({ error: 'Unsupported platform' });
      return;
    }

    console.log(`📥 Download request: ${type} ${format || ''} ${quality || ''}`);

    // Create job
    const job = createJob(url, type, format, quality, startTime, endTime);

    // Process job asynchronously
    processJob(job.id).catch(err => {
      console.error(`Job ${job.id} processing error:`, err);
    });

    // Return job ID immediately
    res.json({ jobId: job.id });
  } catch (error: any) {
    console.error('Download error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create download job' 
    });
  }
}

export async function downloadFileController(req: Request, res: Response): Promise<void> {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      res.status(400).json({ error: 'File ID is required' });
      return;
    }

    const outputPath = getOutputPathByFileId(fileId);
    
    if (!outputPath || !fs.existsSync(outputPath)) {
      res.status(404).json({ error: 'File not found or expired' });
      return;
    }

    // Security check: ensure path is within temp directory
    const tempDir = path.resolve(process.env.TEMP_DIR || './temp');
    const resolvedPath = path.resolve(outputPath);
    if (!resolvedPath.startsWith(tempDir)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const mimeType = getMimeType(outputPath);
    const filename = path.basename(outputPath);

    // Set headers for file download
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // Stream the file
    const fileStream = fs.createReadStream(outputPath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream file' });
      }
    });

    console.log(`📤 Serving file: ${filename} (${mimeType})`);
  } catch (error: any) {
    console.error('Download file error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to download file' 
    });
  }
}
