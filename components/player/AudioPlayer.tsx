"use client"

import { useEffect, useRef, useState } from "react"
import { usePlayerStore } from "@/lib/store/player-store"
import { PlayerControls } from "./PlayerControls"
import { PlayerModal } from "./PlayerModal"
import { ChevronUp, ChevronDown } from "lucide-react"

export function AudioPlayer() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    setCurrentTime,
    setDuration,
    next,
    previous,
    pause,
    play,
  } = usePlayerStore()

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      if (audio.currentTime !== undefined && !isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime)
      }
    }
    const updateDuration = () => {
      if (audio.duration !== undefined && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration)
      }
    }
    const handleEnded = () => next()

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("loadeddata", updateDuration)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("loadeddata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [setCurrentTime, setDuration, next])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch(() => {
        // Error handled silently
      })
    } else {
      audio.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return

    // Initialize duration from song object immediately
    if (currentSong.duration) {
      setDuration(currentSong.duration)
    }

    audio.src = currentSong.filePath
    audio.load()
    play()

    // Track song play
    fetch(`/api/songs/${currentSong.id}/play`, {
      method: "POST",
    }).catch(() => {
      // Error handled silently
    })
  }, [currentSong, play, setDuration])

  if (!currentSong) return null

  return (
    <>
      <audio ref={audioRef} />
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-50 transition-all duration-300 ${
          isExpanded ? "h-48" : "h-auto"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-end py-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
              title={isExpanded ? "Collapse player" : "Expand player"}
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronUp className="h-5 w-5" />
              )}
            </button>
          </div>
          <div 
            className="cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <PlayerControls isExpanded={isExpanded} />
          </div>
        </div>
      </div>
      <PlayerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

