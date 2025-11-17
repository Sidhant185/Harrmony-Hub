"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { SongCard } from "@/components/song/SongCard"
import { SongCardSkeleton } from "@/components/ui/SkeletonLoader"
import { EmptyState } from "@/components/ui/EmptyState"
import { User, Clock, Heart, Upload, Music } from "lucide-react"
import { formatDuration } from "@/lib/utils"

interface ProfileData {
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    createdAt: string
  }
  stats: {
    totalListeningTime: number
    totalSongsPlayed: number
    uniqueSongsPlayed: number
    likedSongsCount: number
    uploadedSongsCount: number
  }
  recentHistory: Array<{
    id: string
    songId: string
    playedAt: string
    song: {
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
  }>
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [likedSongs, setLikedSongs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"history" | "liked">("history")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchProfile()
      fetchLikedSongs()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  const fetchLikedSongs = async () => {
    try {
      const response = await fetch("/api/profile/liked-songs?limit=50")
      if (response.ok) {
        const data = await response.json()
        setLikedSongs(data.likes || [])
      }
    } catch (error) {
      // Error handled silently
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-white/10 animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SongCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon="user"
          title="Profile not found"
          description="Unable to load your profile information."
        />
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8">
          {profileData.user.image ? (
            <img
              src={profileData.user.image}
              alt={profileData.user.name || "User"}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
              <User className="h-12 w-12 text-black" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {profileData.user.name || "User"}
            </h1>
            <p className="text-white/70 mb-1">{profileData.user.email}</p>
            <p className="text-sm text-white/50">
              Member since {formatDate(profileData.user.createdAt)}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-[#121212] rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm text-white/70">Listening Time</span>
            </div>
            <p className="text-xl font-bold text-white">
              {formatDuration(profileData.stats.totalListeningTime)}
            </p>
          </div>
          <div className="bg-[#121212] rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Music className="h-5 w-5 text-primary" />
              <span className="text-sm text-white/70">Songs Played</span>
            </div>
            <p className="text-xl font-bold text-white">
              {profileData.stats.totalSongsPlayed}
            </p>
          </div>
          <div className="bg-[#121212] rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Music className="h-5 w-5 text-primary" />
              <span className="text-sm text-white/70">Unique Songs</span>
            </div>
            <p className="text-xl font-bold text-white">
              {profileData.stats.uniqueSongsPlayed}
            </p>
          </div>
          <div className="bg-[#121212] rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-sm text-white/70">Liked Songs</span>
            </div>
            <p className="text-xl font-bold text-white">
              {profileData.stats.likedSongsCount}
            </p>
          </div>
          <div className="bg-[#121212] rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="h-5 w-5 text-primary" />
              <span className="text-sm text-white/70">Uploaded</span>
            </div>
            <p className="text-xl font-bold text-white">
              {profileData.stats.uploadedSongsCount}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "history"
                ? "text-white border-b-2 border-primary"
                : "text-white/70 hover:text-white"
            }`}
          >
            Recent History
          </button>
          <button
            onClick={() => setActiveTab("liked")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "liked"
                ? "text-white border-b-2 border-primary"
                : "text-white/70 hover:text-white"
            }`}
          >
            Liked Songs
          </button>
        </div>

        {/* Content */}
        {activeTab === "history" ? (
          profileData.recentHistory.length === 0 ? (
            <EmptyState
              icon="music"
              title="No listening history"
              description="Start playing songs to see your listening history here."
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {profileData.recentHistory.map((item) => (
                <SongCard key={item.id} song={item.song} />
              ))}
            </div>
          )
        ) : (
          likedSongs.length === 0 ? (
            <EmptyState
              icon="heart"
              title="No liked songs"
              description="Like songs to see them here."
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {likedSongs.map((like) => (
                <SongCard key={like.id} song={like.song} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}

