"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { SongCard } from "@/components/song/SongCard"
import { PlaylistCard } from "@/components/playlist/PlaylistCard"
import { Heart, Music } from "lucide-react"

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

export default function LibraryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [likedSongs, setLikedSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchLibrary()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router])

  const fetchLibrary = async () => {
    try {
      const [likesRes, playlistsRes] = await Promise.all([
        fetch("/api/likes"),
        fetch("/api/playlists?userId=" + session?.user?.id),
      ])

      if (likesRes.ok) {
        const likesData = await likesRes.json()
        setLikedSongs(likesData.likes?.map((l: any) => l.song) || [])
      }

      if (playlistsRes.ok) {
        const playlistsData = await playlistsRes.json()
        setPlaylists(playlistsData.playlists || [])
      }
    } catch (error) {
      console.error("Error fetching library:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Library</h1>

      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Heart className="h-6 w-6 text-red-500" />
            <h2 className="text-2xl font-bold">Liked Songs</h2>
          </div>
          {likedSongs.length === 0 ? (
            <p className="text-muted-foreground">No liked songs yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {likedSongs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <Music className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Your Playlists</h2>
          </div>
          {playlists.length === 0 ? (
            <p className="text-muted-foreground">No playlists yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

