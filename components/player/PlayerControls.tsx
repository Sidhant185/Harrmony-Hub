"use client"

import { usePlayerStore } from "@/lib/store/player-store"
import { formatDuration } from "@/lib/utils"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat } from "lucide-react"
import Image from "next/image"

export function PlayerControls() {
  const {
    currentSong,
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
  } = usePlayerStore()

  if (!currentSong) return null

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    const audio = document.querySelector("audio") as HTMLAudioElement
    if (audio) {
      audio.currentTime = newTime
    }
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    // Stop propagation for interactive elements so they don't trigger modal
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('input')) {
      e.stopPropagation()
    }
  }

  return (
    <div className="container mx-auto px-4 py-3" onClick={handleContainerClick}>
      <div className="flex items-center gap-4 text-white">
        {/* Song Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {currentSong.coverArt ? (
            <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={currentSong.coverArt}
                alt={currentSong.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-14 h-14 bg-primary/20 rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🎵</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-white">{currentSong.title}</p>
            <p className="text-sm text-white/70 truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleShuffle}
              className={`p-2 hover:bg-white/10 rounded-full transition-colors ${
                shuffle ? "text-primary" : "text-white/70"
              }`}
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button
              onClick={previous}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
            >
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              onClick={togglePlay}
              className="p-3 bg-white text-black rounded-full hover:scale-110 transition-all shadow-lg"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </button>
            <button
              onClick={next}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
            >
              <SkipForward className="h-5 w-5" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`p-2 hover:bg-white/10 rounded-full transition-colors relative ${
                repeat !== "off" ? "text-primary" : "text-white/70"
              }`}
            >
              <Repeat className="h-4 w-4" />
              {repeat === "one" && (
                <span className="absolute top-0 right-0 text-[8px] font-bold text-primary">1</span>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-xs text-white/70 w-10">
              {formatDuration(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
            />
            <span className="text-xs text-white/70 w-10">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
          <button
            onClick={() => {
              const newVolume = volume > 0 ? 0 : 1
              setVolume(newVolume)
            }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
          >
            {volume > 0 ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}

