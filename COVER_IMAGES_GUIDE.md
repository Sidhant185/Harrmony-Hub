# Cover Images Guide

## Where Cover Images Appear

When you upload a song with a cover image, it will appear in the following places throughout the application:

### 1. **Browse Page** (`/browse`)
   - Cover images appear in song cards in the "Recently Added" section
   - If no cover image is uploaded, a music note emoji (🎵) is displayed instead

### 2. **Search Page** (`/search`)
   - Cover images appear in search results for songs
   - Displayed in song cards when searching

### 3. **Library Page** (`/library`)
   - Cover images appear in your liked songs
   - Shown in song cards in the "Liked Songs" section

### 4. **Upload Page** (`/upload`)
   - Cover images appear in the "My Uploads" section
   - Shows all songs you've uploaded with their cover art

### 5. **Player Controls** (Bottom of screen)
   - Small cover image appears next to the song title
   - Shows the currently playing song's cover art
   - If no cover, shows a music note emoji

### 6. **Player Modal/Page** (`/player`)
   - Large cover image displayed prominently
   - Shows the album art for the currently playing song
   - Full-size display in the player interface

### 7. **Playlist Pages** (`/playlist/[id]`)
   - Cover images appear if the playlist has a cover art
   - Individual song cover images may be shown in playlist details

### 8. **Stats Page** (`/stats`)
   - Cover images appear in top songs listings
   - Displayed in song cards showing popular tracks

### 9. **Admin Dashboard** (`/admin`)
   - Cover images appear in the Songs management table
   - Shows cover art for all songs in the system

## How Cover Images Work

1. **Upload Process:**
   - When uploading a song, you can optionally upload a cover image
   - Supported formats: JPEG, PNG, WebP, GIF
   - Cover images are uploaded to Cloudflare R2 (or local storage in development)

2. **Storage:**
   - Cover images are stored in the `covers/` folder in R2
   - URLs are saved in the database in the `coverArt` field of the Song model
   - Public URLs are generated for easy access

3. **Display:**
   - Cover images are displayed using Next.js `Image` component for optimization
   - If no cover image is provided, a default music note emoji is shown
   - Images are responsive and adapt to different screen sizes

4. **Fallback:**
   - If a cover image URL is invalid or missing, the app gracefully falls back to showing a music note emoji
   - This ensures the UI always looks good even without cover art

## Technical Details

- **Storage Location:** Cloudflare R2 bucket (or `public/uploads/covers/` in development)
- **URL Format:** 
  - Production: `https://<bucket-name>.<account-id>.r2.dev/covers/<filename>`
  - Or custom domain if configured: `https://<custom-domain>/covers/<filename>`
  - Development: `/uploads/covers/<filename>`
- **Database Field:** `Song.coverArt` (nullable string)

