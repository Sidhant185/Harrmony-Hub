"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { SongCard } from "@/components/song/SongCard"
import { usePlayerStore } from "@/lib/store/player-store"
import { formatDuration } from "@/lib/utils"
import { Play, Plus, Trash2, Edit, X } from "lucide-react"
import Image from "next/image"

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
  userId: string
  songs: Array<{ song: Song; order: number }>
  user?: { id: string; name?: string }
}

export default function PlaylistPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { setCurrentSong, setQueue } = usePlayerStore()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editIsPublic, setEditIsPublic] = useState(false)

  useEffect(() => {
    fetchPlaylist()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchPlaylist = async () => {
    try {
      const response = await fetch(`/api/playlists/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPlaylist(data.playlist)
      } else if (response.status === 404) {
        router.push("/browse")
      }
    } catch (error) {
      console.error("Error fetching playlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = () => {
    if (!playlist) return
    const songs = playlist.songs.map((ps) => ps.song)
    if (songs.length > 0) {
      setQueue(songs)
      setCurrentSong(songs[0])
    }
  }

  const handleRemoveSong = async (songId: string) => {
    if (!playlist || playlist.userId !== session?.user?.id) return

    try {
      const response = await fetch(
        `/api/playlists/${playlist.id}/songs?songId=${songId}`,
        { method: "DELETE" }
      )

      if (response.ok) {
        setPlaylist({
          ...playlist,
          songs: playlist.songs.filter((ps) => ps.song.id !== songId),
        })
      }
    } catch (error) {
      console.error("Error removing song:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Playlist not found</div>
      </div>
    )
  }

  const isOwner = playlist.userId === session?.user?.id
  const totalDuration = playlist.songs.reduce(
    (sum, ps) => sum + ps.song.duration,
    0
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="relative w-full md:w-64 h-64 rounded-lg overflow-hidden bg-primary/10 flex-shrink-0">
          {playlist.coverArt ? (
            <Image
              src={playlist.coverArt}
              alt={playlist.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">🎵</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">Playlist</p>
          <h1 className="text-4xl font-bold mb-4">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-muted-foreground mb-4">{playlist.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <span>{playlist.songs.length} songs</span>
            <span>•</span>
            <span>{formatDuration(totalDuration)}</span>
            {playlist.user?.name && (
              <>
                <span>•</span>
                <span>by {playlist.user.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlay}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Play className="h-5 w-5 fill-current" />
              Play
            </button>
            {isOwner && (
              <>
                <button className="px-4 py-2 border rounded-full hover:bg-accent transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {playlist.songs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            This playlist is empty
          </div>
        ) : (
          playlist.songs.map((playlistSong, index) => (
            <div
              key={playlistSong.song.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors group"
            >
              <span className="text-muted-foreground w-8 text-sm">
                {index + 1}
              </span>
              <button
                onClick={() => {
                  setCurrentSong(playlistSong.song)
                }}
                className="p-2 hover:bg-background rounded-full transition-colors"
              >
                <Play className="h-4 w-4" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{playlistSong.song.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {playlistSong.song.artist}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDuration(playlistSong.song.duration)}
              </span>
              {isOwner && (
                <button
                  onClick={() => handleRemoveSong(playlistSong.song.id)}
                  className="p-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

