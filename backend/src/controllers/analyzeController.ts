import { Request, Response } from 'express';
import { getMediaMetadata } from '../services/mediaService';

export async function analyzeController(req: Request, res: Response): Promise<void> {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL is required' });
      return;
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
      res.status(400).json({ error: 'Unsupported platform. Only YouTube and Instagram are supported.' });
      return;
    }

    console.log(`🔍 Analyzing: ${url}`);
    const metadata = await getMediaMetadata(url);
    
    res.json({
      platform: metadata.platform,
      title: metadata.title,
      thumbnail: metadata.thumbnail,
      duration: metadata.duration,
      videoQualities: metadata.videoQualities,
      audioFormats: metadata.audioFormats,
      audioQualities: metadata.audioQualities,
      creator: metadata.author,
    });
  } catch (error: any) {
    console.error('Analyze error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to analyze media' 
    });
  }
}
