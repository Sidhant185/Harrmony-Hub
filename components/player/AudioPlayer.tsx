"use client"

import { useEffect, useRef, useState } from "react"
import { usePlayerStore } from "@/lib/store/player-store"
import { PlayerControls } from "./PlayerControls"
import { PlayerModal } from "./PlayerModal"

export function AudioPlayer() {
  const [isModalOpen, setIsModalOpen] = useState(false)
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

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => next()

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
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

    audio.src = currentSong.filePath
    audio.load()
    play()

    // Track song play
    fetch(`/api/songs/${currentSong.id}/play`, {
      method: "POST",
    }).catch(() => {
      // Error handled silently
    })
  }, [currentSong, play])

  if (!currentSong) return null

  return (
    <>
      <audio ref={audioRef} />
      <div 
        className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-50 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <PlayerControls />
      </div>
      <PlayerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

