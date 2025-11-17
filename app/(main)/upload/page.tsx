"use client"

import { UploadForm } from "@/components/upload/UploadForm"
import { Music, Upload as UploadIcon } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { SongCard } from "@/components/song/SongCard"
import { SongCardSkeleton } from "@/components/ui/SkeletonLoader"
import { EmptyState } from "@/components/ui/EmptyState"
import { ConfirmationModal } from "@/components/ui/ConfirmationModal"
import { useToast } from "@/components/ui/ToastProvider"
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
  playCount: number
  uploadedAt: string
}

export default function UploadPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; songId: string | null }>({
    isOpen: false,
    songId: null,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchUploads()
    }
  }, [status, router])

  const fetchUploads = async () => {
    try {
      const response = await fetch("/api/my-uploads")
      if (response.ok) {
        const data = await response.json()
        setSongs(data.songs || [])
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (songId: string) => {
    setDeleteConfirm({ isOpen: true, songId })
  }

  const handleDelete = async () => {
    if (!deleteConfirm.songId) return

    try {
      const response = await fetch(`/api/songs/${deleteConfirm.songId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSongs(songs.filter((s) => s.id !== deleteConfirm.songId))
        showToast("Song deleted successfully", "success")
        setDeleteConfirm({ isOpen: false, songId: null })
      } else {
        const data = await response.json()
        showToast(data.error || "Failed to delete song", "error")
      }
    } catch (error) {
      showToast("Failed to delete song", "error")
    }
  }

  const handleUploadSuccess = () => {
    fetchUploads()
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Upload Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/20 rounded-full">
                <Music className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-white">Upload Your Music</h1>
            <p className="text-white/70">
              Share your music with the world.
            </p>
          </div>

          <div className="bg-[#121212] rounded-lg border border-white/10 p-6">
            <UploadForm onSuccess={handleUploadSuccess} />
          </div>
        </div>

        {/* My Uploads Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <UploadIcon className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-white">My Uploads</h2>
            <span className="text-white/70">({songs.length})</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SongCardSkeleton key={i} />
              ))}
            </div>
          ) : songs.length === 0 ? (
            <EmptyState
              icon="upload"
              title="No uploads yet"
              description="Upload your first song to get started."
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {songs.map((song) => (
                <div key={song.id} className="relative group">
                  <SongCard song={song} />
                  <button
                    onClick={() => handleDeleteClick(song.id)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg z-10"
                    title="Delete song"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <ConfirmationModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, songId: null })}
          onConfirm={handleDelete}
          title="Delete Song"
          message="Are you sure you want to delete this song? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </div>
  )
}
