"use client"

import { usePlayerStore } from "@/lib/store/player-store"
import { formatDuration } from "@/lib/utils"
import { Play, Heart, MoreVertical, Plus } from "lucide-react"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"

interface SongCardProps {
  song: {
    id: string
    title: string
    artist: string
    album?: string
    duration: number
    filePath: string
    coverArt?: string
    genre?: string
  }
  onPlay?: () => void
}

interface Playlist {
  id: string
  name: string
}

export function SongCard({ song, onPlay }: SongCardProps) {
  const { setCurrentSong, setQueue, currentSong, isPlaying } = usePlayerStore()
  const [isLiked, setIsLiked] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()

  const handlePlay = () => {
    setCurrentSong(song)
    if (onPlay) {
      onPlay()
    }
  }

  useEffect(() => {
    const checkLiked = async () => {
      if (!session) return
      try {
        const response = await fetch("/api/likes")
        if (response.ok) {
          const data = await response.json()
          const liked = data.likes?.some((l: any) => l.song.id === song.id)
          setIsLiked(liked || false)
        }
      } catch (error) {
        // Error handled silently
      }
    }
    checkLiked()
  }, [session, song.id])

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!session) return
      try {
        const response = await fetch("/api/playlists?userId=" + session.user?.id)
        if (response.ok) {
          const data = await response.json()
          setPlaylists(data.playlists || [])
        }
      } catch (error) {
        // Error handled silently
      }
    }
    if (showPlaylistMenu) {
      fetchPlaylists()
    }
  }, [session, showPlaylistMenu])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
        setShowPlaylistMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!session) return

    try {
      if (isLiked) {
        await fetch(`/api/likes?songId=${song.id}`, { method: "DELETE" })
        setIsLiked(false)
      } else {
        await fetch("/api/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ songId: song.id }),
        })
        setIsLiked(true)
      }
    } catch (error) {
      // Error handled silently
    }
  }

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!session) return
    try {
      const response = await fetch(`/api/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId: song.id }),
      })
      if (response.ok) {
        setShowPlaylistMenu(false)
        setShowMenu(false)
      }
    } catch (error) {
      // Error handled silently
    }
  }

  const isCurrentlyPlaying = currentSong?.id === song.id && isPlaying

  return (
    <div className="group bg-[#181818] rounded-lg p-4 hover:bg-[#282828] transition-all duration-200 cursor-pointer animate-fade-in">
      <div className="relative aspect-square mb-3 rounded-md overflow-hidden bg-[#333]">
        {song.coverArt ? (
          <Image
            src={song.coverArt}
            alt={song.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🎵</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={handlePlay}
            className="p-3 bg-primary text-black rounded-full hover:scale-110 transition-all shadow-lg"
          >
            {isCurrentlyPlaying ? (
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
              </div>
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </button>
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="font-medium truncate text-white">{song.title}</h3>
        <p className="text-sm text-white/70 truncate">{song.artist}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-white/70">
            {formatDuration(song.duration)}
          </span>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {session && (
              <button
                onClick={handleLike}
                className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${
                  isLiked ? "text-primary" : "text-white/70"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                />
              </button>
            )}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/70"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {showMenu && session && (
                <div className="absolute bottom-full right-0 mb-2 bg-[#282828] rounded-lg shadow-xl py-2 min-w-[180px] z-50 border border-white/10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowPlaylistMenu(!showPlaylistMenu)
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add to Playlist
                  </button>
                  {showPlaylistMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-[#181818] rounded-lg shadow-xl py-2 min-w-[200px] max-h-[300px] overflow-y-auto border border-white/10">
                      {playlists.length === 0 ? (
                        <div className="px-4 py-2 text-white/70 text-sm">
                          No playlists
                        </div>
                      ) : (
                        playlists.map((playlist) => (
                          <button
                            key={playlist.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddToPlaylist(playlist.id)
                            }}
                            className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors text-sm"
                          >
                            {playlist.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

