"use client"

import { useEffect, useState } from "react"
import { SongCard } from "@/components/song/SongCard"
import { PlaylistCard } from "@/components/playlist/PlaylistCard"

interface Song {
  id: string
  title: string
  artist: string
  album?: string
  duration: number
  filePath: string
  coverArt?: string
  genre?: string
}

interface Playlist {
  id: string
  name: string
  description?: string
  coverArt?: string
  isPublic: boolean
  songs?: Array<{ song: Song }>
  user?: { name?: string }
}

export default function BrowsePage() {
  const [recentSongs, setRecentSongs] = useState<Song[]>([])
  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([])
  const [genres, setGenres] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [songsRes, playlistsRes] = await Promise.all([
          fetch("/api/songs?limit=12"),
          fetch("/api/playlists?isPublic=true&limit=6"),
        ])

        const songsData = await songsRes.json()
        const playlistsData = await playlistsRes.json()

        setRecentSongs(songsData.songs || [])
        setFeaturedPlaylists(playlistsData.playlists || [])

        // Extract unique genres
        const uniqueGenres = [
          ...new Set(
            songsData.songs
              ?.map((s: Song) => s.genre)
              .filter((g: string) => g) || []
          ),
        ] as string[]
        setGenres(uniqueGenres.slice(0, 8))
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-6">Recently Added</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>

        {genres.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Browse by Genre</h2>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <a
                  key={genre}
                  href={`/search?q=${encodeURIComponent(genre)}`}
                  className="px-4 py-2 bg-secondary rounded-full hover:bg-accent transition-colors"
                >
                  {genre}
                </a>
              ))}
            </div>
          </section>
        )}

        {featuredPlaylists.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Featured Playlists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {featuredPlaylists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

