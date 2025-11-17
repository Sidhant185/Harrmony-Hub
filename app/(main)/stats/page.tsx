"use client"

import { useEffect, useState } from "react"
import { SongCard } from "@/components/song/SongCard"
import { SongCardSkeleton } from "@/components/ui/SkeletonLoader"
import { EmptyState } from "@/components/ui/EmptyState"
import { TrendingUp, Calendar, Clock, Music } from "lucide-react"

interface Song {
  id: string
  title: string
  artist: string
  album?: string
  duration: number
  filePath: string
  coverArt?: string
  genre?: string
  playCount: number
}

export default function StatsPage() {
  const [topSongs, setTopSongs] = useState<Song[]>([])
  const [period, setPeriod] = useState<"week" | "month" | "year" | "all">("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopSongs(period)
  }, [period])

  const fetchTopSongs = async (timePeriod: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/stats/top-songs?period=${timePeriod}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setTopSongs(data.songs || [])
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  const formatPeriod = (p: string) => {
    switch (p) {
      case "week":
        return "This Week"
      case "month":
        return "This Month"
      case "year":
        return "This Year"
      default:
        return "All Time"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary/20 rounded-lg">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Top Songs</h1>
            <p className="text-white/70">Most played tracks</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {(["all", "year", "month", "week"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                period === p
                  ? "bg-primary text-black"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {formatPeriod(p)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SongCardSkeleton key={i} />
          ))}
        </div>
      ) : topSongs.length === 0 ? (
        <EmptyState
          icon="music"
          title="No plays yet"
          description={`No songs have been played ${formatPeriod(period).toLowerCase()}.`}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {topSongs.map((song, index) => (
              <div key={song.id} className="relative">
                <SongCard song={song} />
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full">
                  #{index + 1}
                </div>
                <div className="absolute top-2 right-2 bg-primary/90 text-black text-xs font-bold px-2 py-1 rounded-full">
                  {song.playCount} plays
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

