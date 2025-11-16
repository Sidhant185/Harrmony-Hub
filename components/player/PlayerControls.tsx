"use client"

import { usePlayerStore } from "@/lib/store/player-store"
import { formatDuration } from "@/lib/utils"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, RepeatOne } from "lucide-react"
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

  return (
    <div className="container mx-auto px-4 py-3">
      <div className="flex items-center gap-4">
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
            <p className="font-medium truncate">{currentSong.title}</p>
            <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleShuffle}
              className={`p-2 hover:bg-accent rounded-full transition-colors ${
                shuffle ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button
              onClick={previous}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              onClick={togglePlay}
              className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={next}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <SkipForward className="h-5 w-5" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`p-2 hover:bg-accent rounded-full transition-colors ${
                repeat !== "off" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {repeat === "one" ? (
                <RepeatOne className="h-4 w-4" />
              ) : (
                <Repeat className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-xs text-muted-foreground w-10">
              {formatDuration(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-muted-foreground w-10">
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
            className="p-2 hover:bg-accent rounded-full transition-colors"
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
            className="w-24 h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}

