"use client"

import { usePlayerStore } from "@/lib/store/player-store"
import { formatDuration } from "@/lib/utils"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat } from "lucide-react"
import Image from "next/image"

interface PlayerControlsProps {
  isExpanded?: boolean
}

export function PlayerControls({ isExpanded = false }: PlayerControlsProps) {
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

  const handleContainerClick = (e: React.MouseEvent) => {
    // Stop propagation for interactive elements so they don't trigger modal
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('input')) {
      e.stopPropagation()
    }
  }

  return (
    <div className={`py-2 sm:py-3 ${isExpanded ? "pb-4" : ""}`} onClick={handleContainerClick}>
      <div className={`flex items-center gap-2 sm:gap-4 text-white ${isExpanded ? "flex-col" : ""}`}>
        {/* Song Info */}
        <div className={`flex items-center gap-2 sm:gap-3 min-w-0 ${isExpanded ? "w-full justify-center" : "flex-1"}`}>
          {currentSong.coverArt ? (
            <div className={`relative ${isExpanded ? "w-24 h-24" : "w-12 h-12 sm:w-14 sm:h-14"} rounded-md overflow-hidden flex-shrink-0`}>
              <Image
                src={currentSong.coverArt}
                alt={currentSong.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className={`${isExpanded ? "w-24 h-24" : "w-12 h-12 sm:w-14 sm:h-14"} bg-primary/20 rounded-md flex items-center justify-center flex-shrink-0`}>
              <span className={isExpanded ? "text-4xl" : "text-xl sm:text-2xl"}>🎵</span>
            </div>
          )}
          <div className={`min-w-0 ${isExpanded ? "text-center" : "flex-1"}`}>
            <p className={`font-medium truncate text-white ${isExpanded ? "text-lg" : "text-xs sm:text-sm"} ${!isExpanded ? "max-w-[100px] sm:max-w-none" : ""}`}>{currentSong.title}</p>
            <p className={`text-white/70 truncate ${isExpanded ? "text-base" : "text-xs"} ${!isExpanded ? "max-w-[100px] sm:max-w-none" : ""}`}>{currentSong.artist}</p>
            {isExpanded && currentSong.album && (
              <p className="text-sm text-white/50 mt-1">{currentSong.album}</p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className={`flex flex-col items-center gap-2 ${isExpanded ? "w-full" : "flex-1"}`}>
          <div className={`flex items-center gap-1 sm:gap-2 ${isExpanded ? "gap-4" : ""}`}>
            <button
              onClick={toggleShuffle}
              className={`p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors ${
                shuffle ? "text-primary" : "text-white/70"
              }`}
            >
              <Shuffle className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <button
              onClick={previous}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
            >
              <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={togglePlay}
              className={`${isExpanded ? "p-4" : "p-2 sm:p-3"} bg-white text-black rounded-full hover:scale-110 transition-all shadow-lg`}
            >
              {isPlaying ? (
                <Pause className={isExpanded ? "h-6 w-6" : "h-4 w-4 sm:h-5 sm:w-5"} />
              ) : (
                <Play className={`${isExpanded ? "h-6 w-6" : "h-4 w-4 sm:h-5 sm:w-5"} ${isExpanded ? "" : "ml-0.5"}`} />
              )}
            </button>
            <button
              onClick={next}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
            >
              <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors relative ${
                repeat !== "off" ? "text-primary" : "text-white/70"
              }`}
            >
              <Repeat className="h-3 w-3 sm:h-4 sm:w-4" />
              {repeat === "one" && (
                <span className="absolute top-0 right-0 text-[8px] font-bold text-primary">1</span>
              )}
            </button>
          </div>
          <div className={`flex items-center gap-1 sm:gap-2 w-full ${isExpanded ? "max-w-2xl" : "max-w-md"}`}>
            <span className={`text-white/70 ${isExpanded ? "text-sm w-12" : "text-[10px] sm:text-xs w-8 sm:w-10"}`}>
              {formatDuration(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={displayDuration || 0}
              value={currentTime}
              onChange={handleSeek}
              className={`flex-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer ${
                isExpanded 
                  ? "h-2 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4" 
                  : "h-1 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 sm:[&::-webkit-slider-thumb]:w-3 sm:[&::-webkit-slider-thumb]:h-3 sm:[&::-moz-range-thumb]:w-3 sm:[&::-moz-range-thumb]:h-3"
              }`}
            />
            <span className={`text-white/70 ${isExpanded ? "text-sm w-12" : "text-[10px] sm:text-xs w-8 sm:w-10"}`}>
              {formatDuration(displayDuration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className={`flex items-center gap-1 sm:gap-2 min-w-0 ${isExpanded ? "w-full justify-center mt-2" : "flex-1 justify-end"}`}>
          <button
            onClick={() => {
              const newVolume = volume > 0 ? 0 : 1
              setVolume(newVolume)
            }}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
          >
            {volume > 0 ? (
              <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </button>
          {!isExpanded && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 sm:w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer sm:[&::-webkit-slider-thumb]:w-3 sm:[&::-webkit-slider-thumb]:h-3 sm:[&::-moz-range-thumb]:w-3 sm:[&::-moz-range-thumb]:h-3"
            />
          )}
          {isExpanded && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
            />
          )}
        </div>
      </div>
    </div>
  )
}

