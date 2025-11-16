# HarmonyHub - Music Platform

A full-stack Spotify-like music platform built with Next.js, featuring anonymous uploads where users can share music without revealing their identity.

## Features

- 🎵 **Anonymous Uploads**: Anyone can upload music, and uploader identity is never shown publicly
- 🎧 **Music Player**: Full-featured audio player with play/pause, queue, shuffle, repeat, and volume control
- 🔍 **Search**: Full-text search for songs, artists, albums, and playlists
- 📚 **Playlists**: Create, manage, and share playlists
- ❤️ **Likes**: Like your favorite songs
- 📖 **Library**: View your liked songs and playlists
- 🌓 **Dark Mode**: Built-in theme toggle
- ⌨️ **Keyboard Shortcuts**: Control playback with keyboard
- 🔐 **Authentication**: Email/password and OAuth (Google, GitHub) support

## Tech Stack

- **Frontend/Backend**: Next.js 14+ (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Audio Playback**: HTML5 Audio API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Music-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```
DATABASE_URL="postgresql://user:password@localhost:5432/harmonyhub?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Music-platform/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (main)/            # Main app routes
│   └── api/              # API routes
├── components/            # React components
│   ├── player/           # Audio player
│   ├── playlist/         # Playlist components
│   ├── song/             # Song components
│   └── upload/           # Upload components
├── lib/                   # Utilities
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # NextAuth config
│   └── store/            # Zustand stores
└── prisma/                # Database schema
```

## Keyboard Shortcuts

- `Space`: Play/Pause
- `←`: Previous song
- `→`: Next song
- `↑`: Increase volume
- `↓`: Decrease volume

## Anonymous Uploads

One of the key features of HarmonyHub is anonymous uploads:

- Users can upload music without authentication (or with authentication)
- Uploader identity (`uploaderId`) is stored internally but **never exposed** in:
  - Song listings
  - Search results
  - Playlist displays
  - Browse pages
  - API responses
- Users can manage their own uploads privately via `/my-uploads` page
- All songs appear anonymously to the public

## API Routes

- `GET /api/songs` - Get songs (no uploader info)
- `GET /api/songs/[id]` - Get song by ID
- `POST /api/upload` - Upload song (anonymous)
- `GET /api/my-uploads` - Get user's own uploads (private)
- `GET /api/playlists` - Get playlists
- `POST /api/playlists` - Create playlist
- `GET /api/search` - Search songs and playlists
- `POST /api/likes` - Like a song
- `DELETE /api/likes` - Unlike a song

## Future Enhancements

See the plan file for a complete list of future enhancements including:
- Advanced recommendations
- Cloud storage migration
- Podcast support
- Offline playback
- And more...

## License

MIT

