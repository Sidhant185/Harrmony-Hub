"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, Music, Image as ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { config } from "@/lib/config"
import { useToast } from "@/components/ui/ToastProvider"

interface UploadFormProps {
  onSuccess?: () => void
}

export function UploadForm({ onSuccess }: UploadFormProps = {}) {
  const router = useRouter()
  const { showToast } = useToast()
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
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const calculateDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio()
      const url = URL.createObjectURL(file)
      audio.src = url
      audio.addEventListener("loadedmetadata", () => {
        URL.revokeObjectURL(url)
        resolve(Math.floor(audio.duration))
      })
      audio.addEventListener("error", () => {
        URL.revokeObjectURL(url)
        resolve(0)
      })
    })
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("audio/")) {
        setAudioFile(file)
      } else if (file.type.startsWith("image/")) {
        handleCoverFile(file)
      }
    }
  }, [])

  const handleCoverFile = (file: File | null) => {
    if (!file) {
      setCoverFile(null)
      setCoverPreview(null)
      return
    }

    if (!config.upload.allowedImageTypes.includes(file.type as any)) {
      setError("Invalid image type. Please use JPEG, PNG, or WebP.")
      return
    }

    if (file.size > config.upload.maxFileSize) {
      setError(`Image size exceeds ${Math.round(config.upload.maxFileSize / (1024 * 1024))}MB limit`)
      return
    }

    setCoverFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setCoverPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setUploadProgress(0)

    if (!audioFile) {
      setError("Please select an audio file")
      return
    }

    if (!formData.title || !formData.artist) {
      setError("Title and artist are required")
      return
    }

    if (!config.upload.allowedAudioTypes.includes(audioFile.type as any)) {
      setError("Invalid audio file type. Please use MP3, WAV, OGG, M4A, AAC, or FLAC.")
      return
    }

    if (audioFile.size > config.upload.maxFileSize) {
      setError(`File size exceeds ${Math.round(config.upload.maxFileSize / (1024 * 1024))}MB limit`)
      return
    }

    setLoading(true)

    try {
      // Calculate duration
      const duration = await calculateDuration(audioFile)

      const uploadFormData = new FormData()
      uploadFormData.append("file", audioFile)
      uploadFormData.append("title", formData.title)
      uploadFormData.append("artist", formData.artist)
      if (formData.album) uploadFormData.append("album", formData.album)
      if (formData.genre) uploadFormData.append("genre", formData.genre)
      if (coverFile) uploadFormData.append("coverArt", coverFile)
      uploadFormData.append("duration", String(duration))

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setUploadProgress(percentComplete)
        }
      })

      const response = await new Promise<{ ok: boolean; json: () => Promise<any> }>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            json: async () => JSON.parse(xhr.responseText),
          })
        })
        xhr.addEventListener("error", () => reject(new Error("Upload failed")))
        xhr.open("POST", "/api/upload")
        xhr.send(uploadFormData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setSuccess(true)
      showToast("Song uploaded successfully!", "success")
      setFormData({ title: "", artist: "", album: "", genre: "" })
      setAudioFile(null)
      setCoverFile(null)
      setCoverPreview(null)
      setUploadProgress(0)

      if (onSuccess) {
        onSuccess()
      } else {
        setTimeout(() => {
          router.push("/browse")
        }, 2000)
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to upload song"
      setError(errorMessage)
      showToast(errorMessage, "error")
      setUploadProgress(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 text-red-400 p-3 rounded-md text-sm border border-red-500/20">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-primary/10 text-primary p-3 rounded-md text-sm border border-primary/20">
          Song uploaded successfully! Redirecting...
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2 text-white">
          Audio File <span className="text-red-400">*</span>
        </label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-white/20 bg-white/5 hover:bg-white/10"
          }`}
        >
          {audioFile ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Music className="h-5 w-5" />
                <div>
                  <span className="text-sm block">{audioFile.name}</span>
                  <span className="text-xs text-white/50">
                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAudioFile(null)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-white/70" />
              <p className="text-sm text-white/70">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-white/50 mt-1">
                Max {Math.round(config.upload.maxFileSize / (1024 * 1024))}MB
              </p>
              <input
                ref={audioInputRef}
                type="file"
                accept={config.upload.allowedAudioTypes.join(",")}
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="w-full px-3 py-2 border border-white/20 rounded-md bg-[#1a1a1a] text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-white/50"
            placeholder="Song title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            Artist <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.artist}
            onChange={(e) =>
              setFormData({ ...formData, artist: e.target.value })
            }
            required
            className="w-full px-3 py-2 border border-white/20 rounded-md bg-[#1a1a1a] text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-white/50"
            placeholder="Artist name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-white">Album</label>
          <input
            type="text"
            value={formData.album}
            onChange={(e) =>
              setFormData({ ...formData, album: e.target.value })
            }
            className="w-full px-3 py-2 border border-white/20 rounded-md bg-[#1a1a1a] text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-white/50"
            placeholder="Album name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white">Genre</label>
          <input
            type="text"
            value={formData.genre}
            onChange={(e) =>
              setFormData({ ...formData, genre: e.target.value })
            }
            className="w-full px-3 py-2 border border-white/20 rounded-md bg-[#1a1a1a] text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-white/50"
            placeholder="Genre"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-white">Cover Art</label>
        <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center bg-white/5 hover:bg-white/10 transition-colors">
          {coverPreview ? (
            <div className="space-y-2">
              <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-white/70">{coverFile?.name}</span>
                <button
                  type="button"
                  onClick={() => handleCoverFile(null)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer">
              <ImageIcon className="h-6 w-6 mx-auto mb-2 text-white/70" />
              <p className="text-sm text-white/70">
                Click to upload cover art
              </p>
              <input
                ref={coverInputRef}
                type="file"
                accept={config.upload.allowedImageTypes.join(",")}
                onChange={(e) => handleCoverFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {loading && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-white/70 text-center">
            Uploading... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-black py-3 rounded-full font-bold hover:bg-primary/90 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? "Uploading..." : "Upload Song"}
      </button>
    </form>
  )
}

