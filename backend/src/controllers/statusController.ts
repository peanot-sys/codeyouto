import { Request, Response } from 'express';
import { getJob } from '../services/jobService';

export async function statusController(req: Request, res: Response): Promise<void> {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      res.status(400).json({ error: 'Job ID is required' });
      return;
    }

    const job = getJob(jobId);

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const response: any = {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
    };

    if (job.status === 'completed') {
      response.fileId = job.fileId;
      response.downloadUrl = `/api/download/${job.fileId}`;
    }

    if (job.status === 'failed') {
      response.error = job.error;
    }

    res.json(response);
  } catch (error: any) {
    console.error('Status error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get job status' 
    });
  }
}
