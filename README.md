# MediaDrop

A modern, responsive media downloader website built with React, Vite, and Tailwind CSS.

## Features

- **Multi-platform support**: YouTube videos/shorts and Instagram reels
- **Smart analysis**: Automatically detects platform and retrieves media info
- **Flexible download**: Choose video or audio with quality options
- **Precise trimming**: Interactive timeline to select exact start and end points
- **Preview**: Watch the selected portion before downloading
- **Theme support**: Light, Dark, and System themes
- **Fully responsive**: Works on desktop, tablet, and mobile
- **Privacy-first**: No accounts, no history, temporary files only

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- Lucide React (icons)
- Framer Motion (animations)

## Getting Started

### Development

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```
VITE_API_URL=http://localhost:3000  # Backend API URL
```

Leave `VITE_API_URL` empty for demo mode (frontend-only with simulated data).

## Deployment

The project is configured for Netlify deployment via GitHub integration.

- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirects configured in `netlify.toml`

## Backend

The frontend communicates with a backend API for media processing. The backend is responsible for:

- URL validation
- Media information retrieval (yt-dlp, etc.)
- Media processing with FFmpeg
- Trimming and format conversion
- Temporary file management

### API Endpoints

- `POST /api/analyze` - Analyze a media URL
- `POST /api/download` - Start a download job
- `GET /api/status/:jobId` - Check job status

## Project Structure

```
src/
├── components/     # UI components
├── hooks/          # Custom React hooks
├── services/       # API and media services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── App.tsx         # Main application component
├── main.tsx        # Entry point
└── index.css       # Global styles and theme
```

## License

MIT
