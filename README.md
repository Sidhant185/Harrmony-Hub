# HarmonyHub - Music Platform 🎵

A full-stack Spotify-like music platform built with Next.js, where users can discover, upload, share, and enjoy music. Built with modern web technologies and optimized for production deployment.

![HarmonyHub](https://img.shields.io/badge/HarmonyHub-Music%20Platform-primary?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?style=for-the-badge&logo=postgresql)

## ✨ Features

### 🎵 Core Features
- **Music Uploads**: Upload and share your music with the world (supports MP3, WAV, OGG, M4A)
- **Music Player**: Full-featured audio player with play/pause, queue management, shuffle, repeat modes, and volume control
- **Search**: Full-text search for songs, artists, albums, and playlists with real-time results
- **Playlists**: Create, manage, edit, and share public or private playlists
- **Likes**: Like your favorite songs and build your music library
- **Library**: View your liked songs and personal playlists in one place
- **Statistics**: View top songs by period (week, month, year, all-time) and your personal listening statistics
- **Profile**: Track your listening history, liked songs, and upload statistics
- **Sharing**: Share songs and playlists with native Web Share API or clipboard fallback

### 🎨 User Experience
- **Dark Mode**: Built-in theme toggle with system preference detection
- **Mobile Responsive**: Fully optimized for mobile, tablet, and desktop devices
- **Keyboard Shortcuts**: Control playback with keyboard shortcuts
- **Smooth Animations**: Polished UI with smooth transitions and loading states
- **Toast Notifications**: User-friendly notifications for all actions

### 🔐 Authentication & Security
- **Email/Password Authentication**: Secure user registration and login
- **Google OAuth**: One-click sign-in with Google (optional)
- **Session Management**: Secure session handling with NextAuth.js
- **Protected Routes**: Authentication-required pages with automatic redirects
- **Admin Dashboard**: Exclusive admin panel for platform management (restricted access)

### 👑 Admin Features
- **Admin Dashboard**: Comprehensive admin panel accessible only to authorized admin
- **User Management**: View, edit, and delete users with detailed statistics
- **Song Management**: View and delete songs from the platform
- **Playlist Management**: View and delete playlists
- **Platform Analytics**: Real-time statistics including:
  - Total users, songs, playlists, likes, plays
  - Growth metrics (last 30 days)
  - Top songs by play count
  - Top genres
  - Recent users
  - Total listening time

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+** (App Router) - React framework with server-side rendering
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **NextAuth.js** - Authentication and session management
- **Lucide React** - Beautiful icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** (Neon) - Production-ready serverless database
- **bcryptjs** - Password hashing

### Storage & Services
- **Cloudflare R2** - S3-compatible object storage for music files and cover images
- **Neon PostgreSQL** - Serverless PostgreSQL database
- **Vercel** - Hosting and deployment platform

### Audio
- **HTML5 Audio API** - Cross-browser audio playback
- **Custom Audio Player** - Full-featured player with queue management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js 18+** and npm
- **Git** for version control
- **PostgreSQL database** (Neon recommended for production)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Music-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Cloudflare R2 Configuration (for production)
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="your-bucket-name"
R2_PUBLIC_URL="pub-xxxxx.r2.dev" # Optional: your R2 public URL

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Note**: 
- For local development, files are stored in `public/uploads`
- For production, configure Cloudflare R2 (see [DEPLOYMENT.md](./DEPLOYMENT.md))
- Generate `NEXTAUTH_SECRET` using: `openssl rand -base64 32`

### 4. Set Up the Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
Music-platform/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication routes
│   │   ├── login/              # Login page
│   │   └── register/           # Registration page
│   ├── (main)/                  # Main application routes
│   │   ├── admin/              # Admin dashboard (restricted)
│   │   ├── browse/             # Browse songs and playlists
│   │   ├── library/            # User's library (liked songs & playlists)
│   │   ├── player/             # Full-screen player view
│   │   ├── playlist/[id]/      # Individual playlist page
│   │   ├── profile/            # User profile and statistics
│   │   ├── search/             # Search page
│   │   ├── stats/              # Top songs statistics
│   │   ├── upload/             # Upload music page
│   │   ├── error.tsx           # Error boundary
│   │   ├── layout.tsx          # Main layout with navbar and player
│   │   └── not-found.tsx       # 404 page
│   ├── api/                     # API routes
│   │   ├── admin/              # Admin API endpoints
│   │   ├── auth/               # Authentication endpoints
│   │   ├── likes/              # Like/unlike songs
│   │   ├── playlists/          # Playlist CRUD operations
│   │   ├── profile/            # User profile data
│   │   ├── search/             # Search functionality
│   │   ├── songs/              # Song operations
│   │   ├── stats/              # Statistics endpoints
│   │   └── upload/             # File upload endpoint
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage (redirects to browse)
│   └── providers.tsx           # App providers (theme, auth)
├── components/                  # React components
│   ├── navbar/                 # Navigation bar
│   ├── player/                 # Audio player components
│   ├── playlist/               # Playlist components
│   ├── song/                   # Song card components
│   ├── upload/                 # Upload form components
│   └── ui/                     # Reusable UI components
├── lib/                         # Utilities and helpers
│   ├── admin.ts                # Admin access utilities
│   ├── auth.ts                 # NextAuth configuration
│   ├── config.ts               # App configuration
│   ├── prisma.ts               # Prisma client
│   ├── s3.ts                   # Cloudflare R2 utilities
│   ├── store/                  # Zustand stores
│   │   └── player-store.ts     # Audio player state
│   └── utils.ts                # Utility functions
├── prisma/                      # Database schema
│   ├── schema.prisma           # Prisma schema
│   └── seed.ts                 # Database seed script
├── public/                      # Static assets
│   └── uploads/                # Local uploads (development only)
├── types/                       # TypeScript type definitions
├── DEPLOYMENT.md               # Detailed deployment guide
├── COVER_IMAGES_GUIDE.md       # Guide for cover images
├── next.config.js              # Next.js configuration
├── vercel.json                 # Vercel deployment config
└── package.json                # Dependencies and scripts
```

## ⌨️ Keyboard Shortcuts

- `Space` - Play/Pause
- `←` (Left Arrow) - Previous song
- `→` (Right Arrow) - Next song
- `↑` (Up Arrow) - Increase volume
- `↓` (Down Arrow) - Decrease volume
- `ESC` - Close player modal

## 🎵 Music Uploads

### Supported Formats
- **Audio**: MP3, WAV, OGG, M4A
- **Cover Images**: JPEG, PNG, WebP, GIF

### Upload Process
1. Navigate to the Upload page (requires authentication)
2. Select an audio file (drag & drop supported)
3. Fill in song details (title, artist, album, genre)
4. Optionally upload cover art
5. Submit and wait for upload to complete

### Storage
- **Development**: Files stored in `public/uploads/`
- **Production**: Files uploaded to Cloudflare R2
- **Cover Images**: Displayed throughout the app (see [COVER_IMAGES_GUIDE.md](./COVER_IMAGES_GUIDE.md))

## 🔌 API Routes

### Songs
- `GET /api/songs` - Get songs (with pagination, filtering, search)
- `GET /api/songs/[id]` - Get song by ID
- `DELETE /api/songs/[id]` - Delete song (owner or admin only)
- `POST /api/songs/[id]/play` - Track song play

### Upload
- `POST /api/upload` - Upload new song (authenticated users)
- `GET /api/my-uploads` - Get current user's uploads

### Playlists
- `GET /api/playlists` - Get playlists (with filtering)
- `POST /api/playlists` - Create new playlist
- `GET /api/playlists/[id]` - Get playlist by ID
- `PATCH /api/playlists/[id]` - Update playlist (owner only)
- `DELETE /api/playlists/[id]` - Delete playlist (owner or admin only)
- `POST /api/playlists/[id]/songs` - Add song to playlist
- `DELETE /api/playlists/[id]/songs` - Remove song from playlist

### Likes
- `GET /api/likes` - Get user's liked songs
- `POST /api/likes` - Like a song
- `DELETE /api/likes?songId=xxx` - Unlike a song

### Search
- `GET /api/search?q=query` - Search songs and playlists

### Statistics
- `GET /api/stats/top-songs?period=week|month|year|all` - Get top songs by period

### Profile
- `GET /api/profile` - Get user profile and statistics
- `GET /api/profile/listening-history` - Get listening history
- `GET /api/profile/liked-songs` - Get liked songs

### Admin (Admin Only)
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users` - Update user
- `DELETE /api/admin/users?userId=xxx` - Delete user
- `GET /api/admin/songs` - Get all songs
- `DELETE /api/admin/songs?songId=xxx` - Delete song
- `GET /api/admin/playlists` - Get all playlists
- `DELETE /api/admin/playlists?playlistId=xxx` - Delete playlist

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

## 🚀 Deployment

This application is configured for production deployment with:

- **Vercel** - Next.js hosting with automatic deployments
- **Neon** - Serverless PostgreSQL database
- **Cloudflare R2** - S3-compatible object storage

### Quick Deployment Steps

1. **Set up services** (see [DEPLOYMENT.md](./DEPLOYMENT.md) for details):
   - Create Neon database
   - Set up Cloudflare R2 bucket
   - Configure Google OAuth (optional)

2. **Deploy to Vercel**:
   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Add environment variables** in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your Vercel domain)
   - `NEXTAUTH_SECRET`
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_PUBLIC_URL`
   - `GOOGLE_CLIENT_ID` (optional)
   - `GOOGLE_CLIENT_SECRET` (optional)

4. **Update Google OAuth** redirect URIs with your production URL

5. **Run database migrations**:
   ```bash
   npx prisma db push
   ```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🔒 Security Features

- ✅ All secrets stored in environment variables
- ✅ Password hashing with bcrypt
- ✅ Secure session management with NextAuth
- ✅ Protected API routes with authentication
- ✅ Admin access restricted to authorized email
- ✅ Input validation on all forms
- ✅ SQL injection protection (Prisma ORM)
- ✅ File type and size validation
- ✅ CORS protection
- ✅ XSS protection (React's built-in escaping)

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1280px+)

Features include:
- Hamburger menu for mobile navigation
- Touch-friendly controls
- Responsive grids and layouts
- Mobile-optimized player controls
- Adaptive typography and spacing

## 🎨 Cover Images

Cover images uploaded with songs appear throughout the application:
- Browse page song cards
- Search results
- Library page
- Upload page ("My Uploads")
- Player controls (bottom bar)
- Player page (full view)
- Playlist pages
- Stats page
- Admin dashboard

For detailed information, see [COVER_IMAGES_GUIDE.md](./COVER_IMAGES_GUIDE.md).

## 👑 Admin Dashboard

The admin dashboard provides comprehensive platform management:

- **Access**: Restricted to `Sidhantpande222@gmail.com` only
- **Features**:
  - Platform overview with statistics
  - User management (view, edit, delete)
  - Song management
  - Playlist management
  - Growth analytics
  - Top content insights

Access the admin dashboard via the "Admin" link in the navbar (visible only to admin).

## 🧪 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database operations
npm run db:push      # Push schema to database
npm run db:generate  # Generate Prisma Client
npm run db:seed      # Seed database (if seed script exists)
```

### Environment Variables

See `.env.example` for all required environment variables.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Neon](https://neon.tech/)
- File storage by [Cloudflare R2](https://www.cloudflare.com/products/r2/)
- Icons by [Lucide](https://lucide.dev/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Made with ❤️ for music lovers**
