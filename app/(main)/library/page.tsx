"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { SongCard } from "@/components/song/SongCard"
import { PlaylistCard } from "@/components/playlist/PlaylistCard"
import { SongCardSkeleton, PlaylistCardSkeleton } from "@/components/ui/SkeletonLoader"
import { EmptyState } from "@/components/ui/EmptyState"
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
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Your Library</h1>
        <div className="space-y-12">
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Heart className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-white">Liked Songs</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SongCardSkeleton key={i} />
              ))}
            </div>
          </section>
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Music className="h-6 w-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <PlaylistCardSkeleton key={i} />
              ))}
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Your Library</h1>

      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Heart className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-white">Liked Songs</h2>
          </div>
          {likedSongs.length === 0 ? (
            <EmptyState
              icon="heart"
              title="No liked songs yet"
              description="Start exploring and like your favorite songs to see them here."
              action={{ label: "Browse Music", href: "/browse" }}
            />
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
            <Music className="h-6 w-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
          </div>
          {playlists.length === 0 ? (
            <EmptyState
              icon="music"
              title="No playlists yet"
              description="Create your first playlist to organize your favorite songs."
              action={{ label: "Create Playlist", href: "/browse" }}
            />
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

