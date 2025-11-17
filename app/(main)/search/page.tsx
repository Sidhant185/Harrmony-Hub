"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SongCard } from "@/components/song/SongCard"
import { PlaylistCard } from "@/components/playlist/PlaylistCard"
import { SongCardSkeleton, PlaylistCardSkeleton } from "@/components/ui/SkeletonLoader"
import { EmptyState } from "@/components/ui/EmptyState"
import { config } from "@/lib/config"
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
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [songs, setSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSongs([])
      setPlaylists([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSongs(data.songs || [])
        setPlaylists(data.playlists || [])
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initialQuery = searchParams.get("q") || ""
    setQuery(initialQuery)
    if (initialQuery) {
      performSearch(initialQuery)
    } else {
      setSongs([])
      setPlaylists([])
    }
  }, [searchParams, performSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const newTimer = setTimeout(() => {
      if (value.trim()) {
        router.push(`/search?q=${encodeURIComponent(value)}`, { scroll: false })
      } else {
        router.push("/search", { scroll: false })
      }
    }, config.ui.debounceDelay)

    setDebounceTimer(newTimer)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSubmit} className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
            <input
              type="text"
              name="q"
              value={query}
              onChange={handleInputChange}
              placeholder="Search for songs, artists, albums, or playlists..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-white/50"
            />
        </form>
      </div>

        {loading ? (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-6 text-white">Songs</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SongCardSkeleton key={i} />
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-6 text-white">Playlists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PlaylistCardSkeleton key={i} />
                ))}
              </div>
            </section>
          </div>
        ) : (
        <div className="space-y-8">
          {songs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-white">Songs</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {songs.map((song) => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
            </section>
          )}

          {playlists.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-white">Playlists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {playlists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </section>
          )}

            {!loading && query && songs.length === 0 && playlists.length === 0 && (
              <EmptyState
                icon="search"
                title="No results found"
                description={`We couldn't find anything matching "${query}". Try different keywords.`}
              />
            )}

            {!query && (
              <EmptyState
                icon="search"
                title="Start searching"
                description="Search for songs, artists, albums, or playlists to discover new music."
              />
            )}
        </div>
      )}
    </div>
  )
}

