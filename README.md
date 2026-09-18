# MediaDrop

A modern, responsive media downloader website built with React, Vite, and Tailwind CSS.

## How It Works

### What works out of the box (no backend needed):
- ✅ **YouTube video info** - Fetches real title, thumbnail, and creator via YouTube's oEmbed API
- ✅ **YouTube video preview** - Embeds actual YouTube player with start/end time support
- ✅ **Instagram embed** - Shows Instagram reels/posts via embed
- ✅ **Platform detection** - Automatically detects YouTube (videos, shorts) and Instagram (reels)
- ✅ **Timeline editor** - Interactive start/end selection with draggable handles
- ✅ **Theme switching** - Light, Dark, and System modes

### What needs a backend for actual downloads:
- ⚠️ **Downloading video/audio files** - Requires a backend API with FFmpeg
- ⚠️ **Video duration detection** - YouTube oEmbed doesn't provide duration
- ⚠️ **Audio extraction** - Requires server-side processing

## Quick Start

```bash
npm install
npm run dev
```

Open the app and paste a YouTube URL like:
- `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- `https://youtu.be/dQw4w9WgXcQ`
- `https://www.youtube.com/shorts/xxxxx`

The video will load with its real title and thumbnail, and you can watch it in the embedded player.

## Backend Setup (for actual downloads)

To enable actual file downloads, you need a backend server that:

1. Accepts URLs and returns media info (title, duration, available qualities)
2. Downloads the media using yt-dlp or similar
3. Processes with FFmpeg for trimming and format conversion
4. Serves the processed file for download

### API Endpoints needed:

```
POST /api/analyze
Body: { "url": "https://youtube.com/watch?v=..." }
Response: { "id": "...", "title": "...", "thumbnail": "...", "duration": 123, ... }

POST /api/download
Body: { "url": "...", "type": "video", "format": "mp4", "quality": "720p", "startTime": 10, "endTime": 30 }
Response: { "jobId": "...", "status": "processing" }

GET /api/status/:jobId
Response: { "status": "success", "downloadUrl": "...", "filename": "clip.mp4", "fileSize": "5.2 MB" }
```

### Environment Variables:

```bash
# .env
VITE_API_URL=http://localhost:3000  # Your backend URL
```

## Deployment

The project is configured for Netlify:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- Lucide React (icons)
- YouTube oEmbed API (for video info)
- YouTube Iframe Embed (for preview)

## Project Structure

```
src/
├── components/     # UI components
├── hooks/          # Custom React hooks
├── services/       # API and media services
├── types/          # TypeScript types
├── utils/          # Utility functions
├── App.tsx         # Main app
├── main.tsx        # Entry point
└── index.css       # Styles + theme
```

## Features

- 🎬 Real YouTube video info and embedded preview
- 🎵 Video or Audio download options
- ✂️ Interactive timeline with draggable handles
- 📱 Fully responsive (mobile, tablet, desktop)
- 🌓 Light/Dark/System themes
- 🔒 Privacy-first (no accounts, no history)
- ⚡ Fast, glassmorphism UI with smooth animations
