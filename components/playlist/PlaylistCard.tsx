"use client"

import Link from "next/link"
import Image from "next/image"
import { Music } from "lucide-react"

interface PlaylistCardProps {
  playlist: {
    id: string
    name: string
    description?: string
    coverArt?: string
    isPublic: boolean
    songs?: Array<{ song: any }>
    user?: {
      name?: string
    }
  }
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  const songCount = playlist.songs?.length || 0

  return (
    <Link href={`/playlist/${playlist.id}`}>
      <div className="group bg-[#181818] rounded-lg p-4 hover:bg-[#282828] transition-colors cursor-pointer">
        <div className="relative aspect-square mb-3 rounded-md overflow-hidden bg-[#333]">
          {playlist.coverArt ? (
            <Image
              src={playlist.coverArt}
              alt={playlist.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="h-12 w-12 text-white/50" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-medium truncate text-white">{playlist.name}</h3>
          {playlist.description && (
            <p className="text-sm text-white/70 line-clamp-2">
              {playlist.description}
            </p>
          )}
          <p className="text-xs text-white/70">
            {songCount} {songCount === 1 ? "song" : "songs"}
            {playlist.user?.name && ` • by ${playlist.user.name}`}
          </p>
        </div>
      </div>
    </Link>
  )
}

