"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { SongCard } from "@/components/song/SongCard"
import { usePlayerStore } from "@/lib/store/player-store"
import { formatDuration } from "@/lib/utils"
import { SongListSkeleton, SkeletonLoader } from "@/components/ui/SkeletonLoader"
import { EmptyState } from "@/components/ui/EmptyState"
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

  useEffect(() => {
    if (playlist) {
      setEditName(playlist.name)
      setEditDescription(playlist.description || "")
      setEditIsPublic(playlist.isPublic)
    }
  }, [playlist])

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
      // Error handled silently
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
      // Error handled by response
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (playlist) {
      setEditName(playlist.name)
      setEditDescription(playlist.description || "")
      setEditIsPublic(playlist.isPublic)
    }
  }

  const handleSaveEdit = async () => {
    if (!playlist || !editName.trim()) return

    try {
      const response = await fetch(`/api/playlists/${playlist.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || null,
          isPublic: editIsPublic,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPlaylist(data.playlist)
        setIsEditing(false)
      }
    } catch (error) {
      // Error handled by response
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <SkeletonLoader className="w-full md:w-64 h-64 rounded-lg" />
          <div className="flex-1 space-y-4">
            <SkeletonLoader className="h-12 w-3/4 rounded" />
            <SkeletonLoader className="h-6 w-full rounded" />
            <SkeletonLoader className="h-6 w-2/3 rounded" />
          </div>
        </div>
        <SongListSkeleton count={5} />
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white">Playlist not found</div>
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
          <p className="text-sm text-white/70 mb-2">Playlist</p>
          {isEditing ? (
            <div className="space-y-4 mb-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/20 rounded-lg text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Playlist name"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Description (optional)"
                rows={3}
              />
              <label className="flex items-center gap-2 text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editIsPublic}
                  onChange={(e) => setEditIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span>Make playlist public</span>
              </label>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-4 text-white">{playlist.name}</h1>
              {playlist.description && (
                <p className="text-white/70 mb-4">{playlist.description}</p>
              )}
            </>
          )}
          <div className="flex items-center gap-4 text-sm text-white/70 mb-6">
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
            {!isEditing && (
              <button
                onClick={handlePlay}
                className="px-6 py-3 bg-primary text-black rounded-full hover:scale-105 transition-all flex items-center gap-2 font-bold shadow-lg"
              >
                <Play className="h-5 w-5 fill-current" />
                Play
              </button>
            )}
            {isOwner && (
              <>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-primary text-black rounded-full hover:bg-primary/90 transition-colors font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-white/20 rounded-full hover:bg-white/10 transition-colors text-white"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 border border-white/20 rounded-full hover:bg-white/10 transition-colors text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {playlist.songs.length === 0 ? (
          <EmptyState
            icon="music"
            title="This playlist is empty"
            description={isOwner ? "Add songs to your playlist to get started." : "This playlist doesn't have any songs yet."}
            action={isOwner ? { label: "Browse Songs", href: "/browse" } : undefined}
          />
        ) : (
          playlist.songs.map((playlistSong, index) => (
            <div
              key={playlistSong.song.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-colors group"
            >
              <span className="text-white/70 w-8 text-sm">
                {index + 1}
              </span>
              <button
                onClick={() => {
                  setCurrentSong(playlistSong.song)
                }}
                className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white opacity-0 group-hover:opacity-100"
              >
                <Play className="h-4 w-4" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-white">{playlistSong.song.title}</p>
                <p className="text-sm text-white/70 truncate">
                  {playlistSong.song.artist}
                </p>
              </div>
              <span className="text-sm text-white/70">
                {formatDuration(playlistSong.song.duration)}
              </span>
              {isOwner && (
                <button
                  onClick={() => handleRemoveSong(playlistSong.song.id)}
                  className="p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 rounded-full"
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

