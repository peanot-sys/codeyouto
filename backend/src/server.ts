import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { analyzeRoutes } from './routes/analyzeRoutes';
import { downloadRoutes } from './routes/downloadRoutes';
import { statusRoutes } from './routes/statusRoutes';
import { errorHandler } from './middleware/errorHandler';
import { cleanupService } from './services/cleanupService';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure temp directory exists
const tempDir = process.env.TEMP_DIR || './temp';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/status', statusRoutes);

// Error handler
app.use(errorHandler);

// Start cleanup service
cleanupService.startCleanup();

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MediaDrop backend running on port ${PORT}`);
  console.log(`📁 Temp directory: ${path.resolve(tempDir)}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export default app;
