# Quick Start Guide

## Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **yt-dlp** - Media retrieval tool
   - macOS: `brew install yt-dlp`
   - Linux: `sudo apt-get install yt-dlp`
   - Windows: [Download](https://github.com/yt-dlp/yt-dlp/releases)
3. **FFmpeg** - Media processing (installed automatically via npm package)

## Local Development

### 1. Start Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on `http://localhost:3000`

### 2. Start Frontend

```bash
# In root directory
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`

### 3. Test

1. Open `http://localhost:5173`
2. Paste a YouTube URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
3. Click "Analyze"
4. Select Video or Audio
5. Choose quality
6. Select time range (optional)
7. Click "Download"
8. Wait for processing
9. Download your file!

## Production Deployment

### Option 1: Render (Recommended)

1. Push code to GitHub
2. Deploy backend to Render (see README.md)
3. Deploy frontend to Netlify (already configured)
4. Set `VITE_API_URL` in Netlify environment variables

### Option 2: Self-Hosted

1. Deploy backend to any Node.js hosting (VPS, Docker, etc.)
2. Deploy frontend to any static hosting (Netlify, Vercel, etc.)
3. Configure environment variables

## Testing the Pipeline

### Test Audio Extraction (MP3)

```bash
# Start backend
cd backend && npm run dev

# In another terminal, test the API
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# Note the response, then start download
curl -X POST http://localhost:3000/api/download \
  -H "Content-Type: application/json" \
  -d '{
    "url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "type":"audio",
    "format":"mp3",
    "quality":"192",
    "startTime":0,
    "endTime":10
  }'

# Check status (replace JOB_ID with actual ID from above)
curl http://localhost:3000/api/status/JOB_ID

# When status is "completed", download the file
curl -O http://localhost:3000/api/download/FILE_ID
```

### Verify Output

```bash
# Check if file is valid MP3
file output.mp3
# Should show: Audio file with ID3 version 2...

# Check duration
ffprobe -i output.mp3 -show_entries format=duration -v quiet -of csv="p=0"
# Should show: 10.000000 (or close to it)
```

## Common Issues

### "yt-dlp: command not found"
Install yt-dlp and ensure it's in your PATH.

### "Backend service is currently unavailable"
- Check backend is running
- Verify VITE_API_URL is set correctly
- Check browser console for CORS errors

### "Processing failed"
- Check backend logs for detailed error
- Verify FFmpeg is installed
- Check available disk space

### "Failed to download media"
- Check internet connection
- Verify URL is public and accessible
- Some videos may be restricted

## Next Steps

1. Test with different YouTube URLs
2. Try different qualities and formats
3. Test trimming with start/end times
4. Deploy to production
5. Monitor logs and performance

## Support

Check the main README.md for detailed documentation.
