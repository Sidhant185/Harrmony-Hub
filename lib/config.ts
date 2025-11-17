// Application-wide configuration constants

export const config = {
  // Browse page limits
  browse: {
    recentSongsLimit: 12,
    featuredPlaylistsLimit: 6,
    genresLimit: 8,
  },

  // API default limits
  api: {
    defaultLimit: 50,
    defaultOffset: 0,
    maxLimit: 100,
  },

  // File upload configuration
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB in bytes
    allowedAudioTypes: [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "audio/m4a",
      "audio/aac",
      "audio/flac",
    ],
    allowedImageTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ],
  },

  // Pagination
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },

  // UI constants
  ui: {
    skeletonRows: 6,
    debounceDelay: 300, // milliseconds for search debouncing
    animationDuration: 200, // milliseconds for transitions
  },
} as const

