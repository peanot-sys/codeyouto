# MediaDrop

A modern, responsive media downloader that **actually works**. Download YouTube videos and audio directly from your browser.

## ✅ What Works Right Now

### YouTube (Fully Working)
- **Real video info** - Title, thumbnail, duration, creator (via Invidious API)
- **Real video preview** - Embedded YouTube player with start/end time support
- **Real downloads** - Direct download links for video (MP4) and audio
- **Multiple qualities** - 360p, 480p, 720p, 1080p (whatever's available)
- **All URL formats** - Regular videos, Shorts, youtu.be links

### Instagram
- **Video preview** - Embedded Instagram player
- **Download** - Limited (Instagram has strong protections)

## How It Works

1. Paste a YouTube URL
2. The app fetches real video info via Invidious API (through CORS proxy)
3. Shows thumbnail, title, duration, available qualities
4. Select video or audio mode
5. Pick quality
6. Use the timeline to select start/end (optional)
7. Preview the selection in the embedded player
8. Click Download - get a direct download link

## Tech Stack

- **React 18** + TypeScript
- **Vite** for fast builds
- **Tailwind CSS v4** for styling
- **Invidious API** for YouTube data and stream URLs
- **CORS Proxy** (corsproxy.io) for browser-based API calls
- **Lucide React** for icons

## How Downloads Work

The app uses **Invidious** (open-source YouTube frontend) to:
1. Get video metadata (title, thumbnail, duration)
2. Get direct stream URLs for different qualities
3. Proxy the download through Invidious servers

This means **no backend needed** - it works entirely from the browser!

## Deployment

Already configured for Netlify via GitHub:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Limitations

- **YouTube**: Works great for most videos. Some age-restricted or private videos may not work.
- **Instagram**: Preview works, but downloads are limited due to Instagram's protections.
- **Duration**: If Invidious can't determine duration, defaults to 5 minutes. Adjust timeline manually.
- **CORS Proxies**: Uses public CORS proxies. If they're down, the app may not work. You can self-host a proxy or Invidious instance.

## Self-Hosting

For maximum reliability, you can:

1. **Host your own Invidious instance** and set it as the primary
2. **Host your own CORS proxy** (e.g., cors-anywhere)
3. **Deploy a backend** that uses yt-dlp + FFmpeg for processing

Edit `src/services/mediaService.ts` to change the Invidious instances and CORS proxies.

## Privacy

- No accounts required
- No download history stored
- No personal data collected
- All processing happens in your browser
- Temporary API calls only

## License

MIT
