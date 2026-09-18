import fs from 'fs';
import path from 'path';
import { getAllJobs, deleteJob } from './jobService';

const CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 minutes
const JOB_TTL = 60 * 60 * 1000; // 1 hour

class CleanupService {
  private intervalId: NodeJS.Timeout | null = null;

  startCleanup(): void {
    console.log('🧹 Cleanup service started');
    
    // Run cleanup immediately
    this.cleanup();
    
    // Then run periodically
    this.intervalId = setInterval(() => {
      this.cleanup();
    }, CLEANUP_INTERVAL);
  }

  stopCleanup(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🧹 Cleanup service stopped');
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const jobs = getAllJobs();
    let cleaned = 0;

    for (const job of jobs) {
      const age = now - job.createdAt.getTime();
      
      // Delete jobs older than TTL
      if (age > JOB_TTL) {
        console.log(`🗑️ Cleaning up expired job: ${job.id}`);
        deleteJob(job.id);
        cleaned++;
      }
    }

    // Also cleanup orphaned temp directories
    this.cleanupOrphanedDirs();

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired jobs`);
    }
  }

  private cleanupOrphanedDirs(): void {
    const tempDir = process.env.TEMP_DIR || './temp';
    
    if (!fs.existsSync(tempDir)) {
      return;
    }

    const jobs = getAllJobs();
    const jobIds = new Set(jobs.map(j => j.id));

    try {
      const dirs = fs.readdirSync(tempDir);
      
      for (const dir of dirs) {
        const dirPath = path.join(tempDir, dir);
        const stat = fs.statSync(dirPath);
        
        if (stat.isDirectory() && !jobIds.has(dir)) {
          // Check if directory is old
          const age = Date.now() - stat.mtime.getTime();
          if (age > JOB_TTL) {
            console.log(`🗑️ Removing orphaned directory: ${dir}`);
            fs.rmSync(dirPath, { recursive: true, force: true });
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up orphaned directories:', error);
    }
  }
}

export const cleanupService = new CleanupService();
