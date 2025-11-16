"use client"

import { useState } from "react"
import { Upload, X, Music } from "lucide-react"
import { useRouter } from "next/navigation"

export function UploadForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
    genre: "",
  })
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!audioFile) {
      setError("Please select an audio file")
      return
    }

    if (!formData.title || !formData.artist) {
      setError("Title and artist are required")
      return
    }

    setLoading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", audioFile)
      uploadFormData.append("title", formData.title)
      uploadFormData.append("artist", formData.artist)
      if (formData.album) uploadFormData.append("album", formData.album)
      if (formData.genre) uploadFormData.append("genre", formData.genre)
      if (coverFile) uploadFormData.append("coverArt", coverFile)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setSuccess(true)
      setFormData({ title: "", artist: "", album: "", genre: "" })
      setAudioFile(null)
      setCoverFile(null)

      setTimeout(() => {
        router.push("/browse")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to upload song")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 text-green-500 p-3 rounded-md text-sm">
          Song uploaded successfully! Redirecting...
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          Audio File <span className="text-destructive">*</span>
        </label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          {audioFile ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                <span className="text-sm">{audioFile.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setAudioFile(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Title <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Song title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Artist <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.artist}
            onChange={(e) =>
              setFormData({ ...formData, artist: e.target.value })
            }
            required
            className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Artist name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Album</label>
          <input
            type="text"
            value={formData.album}
            onChange={(e) =>
              setFormData({ ...formData, album: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Album name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Genre</label>
          <input
            type="text"
            value={formData.genre}
            onChange={(e) =>
              setFormData({ ...formData, genre: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Genre"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Cover Art</label>
        <div className="border-2 border-dashed rounded-lg p-4 text-center">
          {coverFile ? (
            <div className="flex items-center justify-between">
              <span className="text-sm">{coverFile.name}</span>
              <button
                type="button"
                onClick={() => setCoverFile(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <p className="text-sm text-muted-foreground">
                Click to upload cover art
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Uploading..." : "Upload Song"}
      </button>
    </form>
  )
}

