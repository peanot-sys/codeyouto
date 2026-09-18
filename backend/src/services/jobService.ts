import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { getMediaMetadata, downloadMedia, StreamInfo } from './mediaService';
import { 
  extractAudioToMp3, 
  extractAudioToM4a, 
  trimVideo, 
  trimAudio,
  validateOutput,
  getMimeType
} from './ffmpegService';

export type JobStatus = 'queued' | 'preparing' | 'processing' | 'trimming' | 'converting' | 'completed' | 'failed';

export interface Job {
  id: string;
  url: string;
  type: 'video' | 'audio';
  format?: string;
  quality?: string;
  startTime?: number;
  endTime?: number;
  status: JobStatus;
  progress: number;
  error?: string;
  outputPath?: string;
  fileId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory job storage (use Redis/DB in production)
const jobs = new Map<string, Job>();

// Create a new job
export function createJob(
  url: string,
  type: 'video' | 'audio',
  format?: string,
  quality?: string,
  startTime?: number,
  endTime?: number
): Job {
  const id = uuidv4();
  const job: Job = {
    id,
    url,
    type,
    format,
    quality,
    startTime,
    endTime,
    status: 'queued',
    progress: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  jobs.set(id, job);
  console.log(`📝 Job created: ${id}`);
  return job;
}

// Get job by ID
export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

// Update job status
export function updateJobStatus(id: string, status: JobStatus, progress?: number, error?: string): void {
  const job = jobs.get(id);
  if (job) {
    job.status = status;
    if (progress !== undefined) job.progress = progress;
    if (error) job.error = error;
    job.updatedAt = new Date();
    console.log(`🔄 Job ${id}: ${status} (${progress || 0}%)`);
  }
}

// Process a job
export async function processJob(jobId: string): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  const tempDir = process.env.TEMP_DIR || './temp';
  const jobDir = path.join(tempDir, jobId);

  try {
    // Step 1: Preparing - Download media
    updateJobStatus(jobId, 'preparing', 10);
    console.log(`📥 Downloading media for job ${jobId}...`);
    
    const streamInfo = await downloadMedia(
      job.url,
      jobId,
      job.quality,
      job.type
    );

    if (!streamInfo.videoPath && !streamInfo.audioPath) {
      throw new Error('No media streams downloaded');
    }

    updateJobStatus(jobId, 'processing', 30);

    // Step 2: Processing - FFmpeg operations
    let outputPath: string;
    const inputPath = job.type === 'audio' ? streamInfo.audioPath! : streamInfo.videoPath!;

    if (job.type === 'audio') {
      // Audio processing
      updateJobStatus(jobId, 'converting', 50);
      
      const format = job.format || 'mp3';
      const outputFilename = `output.${format}`;
      outputPath = path.join(jobDir, outputFilename);

      if (format === 'mp3') {
        await extractAudioToMp3({
          inputPath,
          outputPath,
          startTime: job.startTime,
          endTime: job.endTime,
          quality: job.quality,
          type: 'audio',
        });
      } else if (format === 'm4a') {
        await extractAudioToM4a({
          inputPath,
          outputPath,
          startTime: job.startTime,
          endTime: job.endTime,
          quality: job.quality,
          type: 'audio',
        });
      } else {
        throw new Error(`Unsupported audio format: ${format}`);
      }
    } else {
      // Video processing
      updateJobStatus(jobId, 'trimming', 50);
      
      const outputFilename = 'output.mp4';
      outputPath = path.join(jobDir, outputFilename);

      await trimVideo({
        inputPath,
        outputPath,
        startTime: job.startTime,
        endTime: job.endTime,
        quality: job.quality,
        type: 'video',
      });
    }

    updateJobStatus(jobId, 'converting', 80);

    // Step 3: Validate output
    const expectedFormat = job.type === 'audio' ? job.format : 'mp4';
    const isValid = validateOutput(outputPath, job.type, expectedFormat);
    
    if (!isValid) {
      throw new Error('Output file validation failed');
    }

    // Step 4: Complete
    const fileId = uuidv4();
    job.outputPath = outputPath;
    job.fileId = fileId;
    updateJobStatus(jobId, 'completed', 100);
    
    console.log(`✅ Job ${jobId} completed. File: ${outputPath}`);
  } catch (error: any) {
    console.error(`❌ Job ${jobId} failed:`, error);
    updateJobStatus(jobId, 'failed', 0, error.message);
    
    // Cleanup on failure
    if (fs.existsSync(jobDir)) {
      fs.rmSync(jobDir, { recursive: true, force: true });
    }
  }
}

// Get output file path by fileId
export function getOutputPathByFileId(fileId: string): string | null {
  for (const job of jobs.values()) {
    if (job.fileId === fileId && job.outputPath) {
      return job.outputPath;
    }
  }
  return null;
}

// Get all jobs (for cleanup)
export function getAllJobs(): Job[] {
  return Array.from(jobs.values());
}

// Delete job
export function deleteJob(id: string): void {
  const job = jobs.get(id);
  if (job) {
    // Cleanup files
    const tempDir = process.env.TEMP_DIR || './temp';
    const jobDir = path.join(tempDir, id);
    if (fs.existsSync(jobDir)) {
      fs.rmSync(jobDir, { recursive: true, force: true });
    }
    jobs.delete(id);
    console.log(`🗑️ Job deleted: ${id}`);
  }
}
