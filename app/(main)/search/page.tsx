"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { SongCard } from "@/components/song/SongCard"
import { PlaylistCard } from "@/components/playlist/PlaylistCard"
import { Search as SearchIcon } from "lucide-react"

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

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [songs, setSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(false)

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSongs([])
      setPlaylists([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setSongs(data.songs || [])
      setPlaylists(data.playlists || [])
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initialQuery = searchParams.get("q")
    if (initialQuery) {
      setQuery(initialQuery)
      performSearch(initialQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(query)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSubmit} className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for songs, artists, albums, or playlists..."
            className="w-full pl-12 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12">Searching...</div>
      ) : (
        <div className="space-y-8">
          {songs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Songs</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {songs.map((song) => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
            </section>
          )}

          {playlists.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Playlists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {playlists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </section>
          )}

          {!loading && query && songs.length === 0 && playlists.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No results found for "{query}"
            </div>
          )}

          {!query && (
            <div className="text-center py-12 text-muted-foreground">
              Start typing to search...
            </div>
          )}
        </div>
      )}
    </div>
  )
}

