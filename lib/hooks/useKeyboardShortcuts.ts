"use client"

import { useEffect } from "react"
import { usePlayerStore } from "@/lib/store/player-store"

export function useKeyboardShortcuts() {
  const {
    isPlaying,
    togglePlay,
    next,
    previous,
    setVolume,
    volume,
  } = usePlayerStore()

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.code) {
        case "Space":
          e.preventDefault()
          togglePlay()
          break
        case "ArrowRight":
          e.preventDefault()
          next()
          break
        case "ArrowLeft":
          e.preventDefault()
          previous()
          break
        case "ArrowUp":
          e.preventDefault()
          setVolume(Math.min(1, volume + 0.1))
          break
        case "ArrowDown":
          e.preventDefault()
          setVolume(Math.max(0, volume - 0.1))
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, togglePlay, next, previous, setVolume, volume])
}

