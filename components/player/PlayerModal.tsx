"use client"

import { usePlayerStore } from "@/lib/store/player-store"
import { formatDuration } from "@/lib/utils"
import { EmptyState } from "@/components/ui/EmptyState"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, X, Trash2 } from "lucide-react"
import Image from "next/image"
import { useEffect } from "react"

interface PlayerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PlayerModal({ isOpen, onClose }: PlayerModalProps) {
  const {
    currentSong,
    queue,
    currentIndex,
    isPlaying,
    volume,
    currentTime,
    duration,
    shuffle,
    repeat,
    togglePlay,
    next,
    previous,
    setVolume,
    setCurrentTime,
    toggleShuffle,
    toggleRepeat,
    removeFromQueue,
  } = usePlayerStore()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !currentSong) return null

  // Use song duration as fallback if audio duration isn't loaded yet
  const displayDuration = duration || currentSong.duration || 0

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    const audio = document.querySelector("audio") as HTMLAudioElement
    if (audio) {
      audio.currentTime = newTime
    }
  }

  const handleQueueItemClick = (index: number) => {
    if (index !== currentIndex && index < queue.length) {
      usePlayerStore.getState().setCurrentIndex(index)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#121212] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Now Playing</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left: Album Art & Song Info */}
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-sm aspect-square mb-6 rounded-lg overflow-hidden bg-[#333] shadow-2xl">
                {currentSong.coverArt ? (
                  <Image
                    src={currentSong.coverArt}
                    alt={currentSong.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-9xl">🎵</span>
                  </div>
                )}
              </div>
              <div className="text-center w-full">
                <h2 className="text-2xl font-bold mb-2 text-white">{currentSong.title}</h2>
                <p className="text-white/70 text-lg mb-1">{currentSong.artist}</p>
                {currentSong.album && (
                  <p className="text-white/50 text-sm">{currentSong.album}</p>
                )}
              </div>
            </div>

            {/* Right: Queue */}
            <div className="bg-[#181818] rounded-lg p-4 max-h-[400px] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4 text-white">Queue</h3>
              {queue.length === 0 ? (
                <EmptyState
                  icon="play"
                  title="Queue is empty"
                  description="Start playing songs to see them in your queue."
                />
              ) : (
                <div className="space-y-2">
                  {queue.map((song, index) => (
                    <div
                      key={song.id}
                      onClick={() => handleQueueItemClick(index)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors group ${
                        index === currentIndex
                          ? "bg-primary/20 border border-primary/50"
                          : "hover:bg-white/10"
                      }`}
                    >
                      <div className="w-10 h-10 rounded overflow-hidden bg-[#333] flex-shrink-0">
                        {song.coverArt ? (
                          <Image
                            src={song.coverArt}
                            alt={song.title}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-lg">🎵</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${index === currentIndex ? "text-primary" : "text-white"}`}>
                          {song.title}
                        </p>
                        <p className="text-sm text-white/70 truncate">{song.artist}</p>
                      </div>
                      <span className="text-xs text-white/50">{formatDuration(song.duration)}</span>
                      {index !== currentIndex && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromQueue(index)
                          }}
                          className="p-1.5 hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4 text-white/70" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Player Controls */}
          <div className="bg-[#181818] rounded-lg p-6">
            {/* Progress Bar */}
            <div className="mb-6">
              <input
                type="range"
                min="0"
                max={displayDuration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-white/70 mt-2">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(displayDuration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={toggleShuffle}
                className={`p-2 hover:bg-white/10 rounded-full transition-colors ${
                  shuffle ? "text-primary" : "text-white/70"
                }`}
              >
                <Shuffle className="h-5 w-5" />
              </button>
              <button
                onClick={previous}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
              >
                <SkipBack className="h-6 w-6" />
              </button>
              <button
                onClick={togglePlay}
                className="p-4 bg-white text-black rounded-full hover:scale-110 transition-all shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-0.5" />
                )}
              </button>
              <button
                onClick={next}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
              >
                <SkipForward className="h-6 w-6" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`p-2 hover:bg-white/10 rounded-full transition-colors relative ${
                  repeat !== "off" ? "text-primary" : "text-white/70"
                }`}
              >
                <Repeat className="h-5 w-5" />
                {repeat === "one" && (
                  <span className="absolute top-0 right-0 text-[8px] font-bold text-primary">1</span>
                )}
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  const newVolume = volume > 0 ? 0 : 1
                  setVolume(newVolume)
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
              >
                {volume > 0 ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-32 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

