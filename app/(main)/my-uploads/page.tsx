"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { SongCard } from "@/components/song/SongCard"
import { Trash2 } from "lucide-react"

interface Song {
  id: string
  title: string
  artist: string
  album?: string
  duration: number
  filePath: string
  coverArt?: string
  genre?: string
  uploadedAt: string
}

export default function MyUploadsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchUploads()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router])

  const fetchUploads = async () => {
    try {
      const response = await fetch("/api/my-uploads")
      if (response.ok) {
        const data = await response.json()
        setSongs(data.songs || [])
      }
    } catch (error) {
      console.error("Error fetching uploads:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (songId: string) => {
    if (!confirm("Are you sure you want to delete this song?")) return

    try {
      const response = await fetch(`/api/songs/${songId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSongs(songs.filter((s) => s.id !== songId))
      }
    } catch (error) {
      console.error("Error deleting song:", error)
      alert("Failed to delete song")
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
      <h1 className="text-3xl font-bold mb-8">My Uploads</h1>

      {songs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="mb-4">You haven't uploaded any songs yet.</p>
          <a
            href="/upload"
            className="text-primary hover:underline"
          >
            Upload your first song
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {songs.map((song) => (
            <div key={song.id} className="relative group">
              <SongCard song={song} />
              <button
                onClick={() => handleDelete(song.id)}
                className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete song"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

