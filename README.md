# HarmonyHub - Music Platform

A full-stack Spotify-like music platform built with Next.js, where users can discover, share, and enjoy music.

## Features

- 🎵 **Music Uploads**: Upload and share your music with the world
- 🎧 **Music Player**: Full-featured audio player with play/pause, queue, shuffle, repeat, and volume control
- 🔍 **Search**: Full-text search for songs, artists, albums, and playlists
- 📚 **Playlists**: Create, manage, and share playlists
- ❤️ **Likes**: Like your favorite songs
- 📖 **Library**: View your liked songs and playlists
- 📊 **Statistics**: View top songs and your listening statistics
- 👤 **Profile**: Track your listening history and liked songs
- 🌓 **Dark Mode**: Built-in theme toggle
- ⌨️ **Keyboard Shortcuts**: Control playback with keyboard
- 🔐 **Authentication**: Email/password authentication

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
- `ESC`: Close player modal

## Music Uploads

Upload and share your music:

- Users can upload music after creating an account
- Share your music with the community
- Manage your uploads from the upload page

## API Routes

- `GET /api/songs` - Get songs
- `GET /api/songs/[id]` - Get song by ID
- `POST /api/songs/[id]/play` - Track song play
- `POST /api/upload` - Upload song
- `GET /api/my-uploads` - Get user's own uploads
- `GET /api/playlists` - Get playlists
- `POST /api/playlists` - Create playlist
- `GET /api/search` - Search songs and playlists
- `POST /api/likes` - Like a song
- `DELETE /api/likes` - Unlike a song
- `GET /api/stats/top-songs` - Get top songs by period
- `GET /api/profile` - Get user profile and statistics
- `GET /api/profile/listening-history` - Get user listening history
- `GET /api/profile/liked-songs` - Get user liked songs

## Future Enhancements

See the plan file for a complete list of future enhancements including:
- Advanced recommendations
- Cloud storage migration
- Podcast support
- Offline playback
- And more...

## License

MIT
