"use client"

import { usePlayerStore } from "@/lib/store/player-store"
import { formatDuration } from "@/lib/utils"
import { Play, Heart, MoreVertical } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
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

export function SongCard({ song, onPlay }: SongCardProps) {
  const { setCurrentSong, setQueue, currentSong, isPlaying } = usePlayerStore()
  const [isLiked, setIsLiked] = useState(false)
  const { data: session } = useSession()

  const handlePlay = () => {
    setCurrentSong(song)
    if (onPlay) {
      onPlay()
    }
  }

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
      console.error("Error toggling like:", error)
    }
  }

  const isCurrentlyPlaying = currentSong?.id === song.id && isPlaying

  return (
    <div className="group bg-card rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer">
      <div className="relative aspect-square mb-3 rounded-md overflow-hidden bg-primary/10">
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
            className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
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
        <h3 className="font-medium truncate">{song.title}</h3>
        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {formatDuration(song.duration)}
          </span>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {session && (
              <button
                onClick={handleLike}
                className={`p-1.5 rounded-full hover:bg-accent transition-colors ${
                  isLiked ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                />
              </button>
            )}
            <button className="p-1.5 rounded-full hover:bg-accent transition-colors text-muted-foreground">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

