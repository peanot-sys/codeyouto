# MediaDrop - Real Media Downloader

A complete media downloading solution with a React frontend and Node.js/FFmpeg backend.

## 🎯 What This Does

- **Real video downloads** from YouTube and Instagram
- **Real audio extraction** to MP3/M4A with quality control
- **Precise trimming** with start/end time selection
- **Multiple quality options** (360p, 480p, 720p, 1080p for video; 128-320kbps for audio)
- **Actual FFmpeg processing** - no fake downloads or simulations

## 🏗️ Architecture

```
React Frontend (Netlify)
        ↓
Node.js Backend (Render)
        ↓
yt-dlp (media retrieval)
        ↓
FFmpeg (processing)
        ↓
Temporary files
        ↓
User downloads real file
```

## 📦 Project Structure

```
/
├── src/                    # React frontend
├── backend/                # Node.js backend
│   ├── src/
│   │   ├── controllers/    # API endpoints
│   │   ├── routes/         # Route definitions
│   │   ├── services/       # Business logic
│   │   │   ├── mediaService.ts    # yt-dlp integration
│   │   │   ├── ffmpegService.ts   # FFmpeg processing
│   │   │   ├── jobService.ts      # Job queue management
│   │   │   └── cleanupService.ts  # Temp file cleanup
│   │   ├── middleware/     # CORS, error handling
│   │   └── server.ts       # Express server
│   ├── package.json
│   └── tsconfig.json
├── netlify.toml            # Frontend deployment config
└── render.yaml             # Backend deployment config
```

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Install yt-dlp (required for media retrieval)
# On macOS:
brew install yt-dlp

# On Ubuntu/Debian:
sudo apt-get install yt-dlp

# On Windows:
# Download from https://github.com/yt-dlp/yt-dlp/releases
# Add to PATH

# Create .env file
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev
```

Backend runs on `http://localhost:3000`

### 2. Frontend Setup

```bash
# In root directory
npm install

# Create .env file
cp .env.example .env
# Set VITE_API_URL=http://localhost:3000

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🔧 Environment Variables

### Backend (backend/.env)

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
TEMP_DIR=./temp
MAX_FILE_SIZE=500
MAX_DURATION=600
DOWNLOAD_URL_TTL=900
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```

## 🌐 Deployment

### Frontend (Netlify)

The frontend is already configured for Netlify deployment via GitHub integration.

**Netlify Environment Variable:**
- Set `VITE_API_URL` to your backend URL (e.g., `https://mediadrop-backend.onrender.com`)

### Backend (Render)

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** `mediadrop-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:** Add all from `backend/.env.example`

6. **Important:** Add a build command to install yt-dlp:
   ```
   apt-get update && apt-get install -y yt-dlp ffmpeg && npm install && npm run build
   ```

7. Deploy!

### Alternative: Docker Deployment

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-slim

# Install yt-dlp and ffmpeg
RUN apt-get update && apt-get install -y \
    yt-dlp \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 📡 API Endpoints

### POST /api/analyze
Analyze a media URL and return metadata.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "platform": "youtube",
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": 123,
  "videoQualities": ["1080p", "720p", "480p", "360p"],
  "audioFormats": ["mp3", "m4a"],
  "audioQualities": ["128", "192", "256", "320"],
  "creator": "Channel Name"
}
```

### POST /api/download
Start a download job.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "type": "audio",
  "format": "mp3",
  "quality": "192",
  "startTime": 84,
  "endTime": 228
}
```

**Response:**
```json
{
  "jobId": "uuid-here"
}
```

### GET /api/status/:jobId
Check job status.

**Response:**
```json
{
  "jobId": "uuid-here",
  "status": "completed",
  "progress": 100,
  "fileId": "file-uuid",
  "downloadUrl": "/api/download/file-uuid"
}
```

### GET /api/download/:fileId
Download the processed file.

Returns the actual file with proper Content-Type and Content-Disposition headers.

## 🎵 Audio Processing Details

### MP3 Extraction
```bash
ffmpeg -i input.wav -vn -acodec libmp3lame -b:a 192k output.mp3
```

### M4A Extraction
```bash
ffmpeg -i input.wav -vn -acodec aac -b:a 192k -movflags +faststart output.m4a
```

### Quality Mapping
- `128` → `128k` bitrate
- `192` → `192k` bitrate
- `256` → `256k` bitrate
- `320` → `320k` bitrate

## 🎬 Video Processing Details

### Video Trimming
```bash
ffmpeg -i input.mp4 -ss 84 -t 144 -c:v libx264 -c:a aac output.mp4
```

### Quality Selection
- `360p` → 640x360
- `480p` → 854x480
- `720p` → 1280x720
- `1080p` → 1920x1080

## 🔒 Security Features

- Input validation on all endpoints
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Path traversal prevention
- Temporary file cleanup (every 15 minutes)
- Job expiration (1 hour TTL)
- No persistent storage of user data

## 🧪 Testing

### Test 1: YouTube Video Download
1. Paste a YouTube URL
2. Select "Video"
3. Choose quality (e.g., 720p)
4. Select time range
5. Click Download
6. Verify: Real MP4 file downloads with video + audio

### Test 2: YouTube Audio to MP3
1. Paste a YouTube URL
2. Select "Audio"
3. Choose "MP3"
4. Choose quality (e.g., 192kbps)
5. Select time range
6. Click Download
7. Verify: Real MP3 file downloads (audio only)

### Test 3: YouTube Audio to M4A
1. Same as Test 2 but choose "M4A"
2. Verify: Real M4A file downloads (audio only)

### Test 4: Invalid URL
1. Paste invalid URL
2. Verify: Shows error message

### Test 5: Invalid Time Range
1. Set start time > end time
2. Verify: Shows validation error

### Test 6: Backend Unavailable
1. Stop backend server
2. Try to analyze URL
3. Verify: Shows "Backend service is currently unavailable"

## 🐛 Troubleshooting

### "yt-dlp not found"
Install yt-dlp:
- macOS: `brew install yt-dlp`
- Linux: `sudo apt-get install yt-dlp`
- Windows: Download from https://github.com/yt-dlp/yt-dlp/releases

### "FFmpeg not found"
Install FFmpeg:
- macOS: `brew install ffmpeg`
- Linux: `sudo apt-get install ffmpeg`
- Windows: Download from https://ffmpeg.org/download.html

### "Backend service is currently unavailable"
- Check backend is running on correct port
- Verify `VITE_API_URL` matches backend URL
- Check CORS settings in backend

### "Failed to download media"
- Check internet connection
- Verify URL is accessible
- Check yt-dlp is installed and in PATH
- Review backend logs for detailed error

### "Processing failed"
- Check FFmpeg is installed
- Review backend logs
- Verify input file was downloaded successfully
- Check available disk space in temp directory

## 📊 Monitoring

Backend logs include:
- Job creation and status updates
- FFmpeg processing progress
- Error details with stack traces
- Cleanup operations

Access logs via:
- Local: Console output
- Render: Dashboard → Logs

## 🔄 Cleanup

The backend automatically:
- Deletes completed jobs after 1 hour
- Removes orphaned temp directories
- Runs cleanup every 15 minutes
- Cleans up failed jobs immediately

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## ⚠️ Legal Notice

This tool is for downloading content you have permission to download. Respect copyright and terms of service of content platforms.
