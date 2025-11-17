import { create } from "zustand"

export interface Song {
  id: string
  title: string
  artist: string
  album?: string
  duration: number
  filePath: string
  coverArt?: string
  genre?: string
}

interface PlayerState {
  currentSong: Song | null
  queue: Song[]
  currentIndex: number
  isPlaying: boolean
  volume: number
  currentTime: number
  duration: number
  shuffle: boolean
  repeat: "off" | "all" | "one"
  setCurrentSong: (song: Song | null) => void
  setCurrentIndex: (index: number) => void
  setQueue: (songs: Song[]) => void
  addToQueue: (song: Song) => void
  removeFromQueue: (index: number) => void
  play: () => void
  pause: () => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  setVolume: (volume: number) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  clearQueue: () => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
  shuffle: false,
  repeat: "off",

  setCurrentSong: (song) => {
    const state = get()
    const index = state.queue.findIndex((s) => s.id === song?.id)
    set({ currentSong: song, currentIndex: index >= 0 ? index : state.currentIndex })
  },
  
  setCurrentIndex: (index) => {
    const state = get()
    if (index >= 0 && index < state.queue.length) {
      set({ currentIndex: index, currentSong: state.queue[index] })
    }
  },
  
  setQueue: (songs) => {
    const shuffled = get().shuffle ? [...songs].sort(() => Math.random() - 0.5) : songs
    set({ queue: shuffled, currentIndex: 0 })
  },

  addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),

  removeFromQueue: (index) =>
    set((state) => ({
      queue: state.queue.filter((_, i) => i !== index),
      currentIndex:
        index < state.currentIndex
          ? state.currentIndex - 1
          : state.currentIndex,
    })),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  next: () => {
    const state = get()
    if (state.repeat === "one") {
      set({ currentTime: 0 })
      return
    }
    if (state.currentIndex < state.queue.length - 1) {
      const nextIndex = state.currentIndex + 1
      set({
        currentIndex: nextIndex,
        currentSong: state.queue[nextIndex],
        currentTime: 0,
      })
    } else if (state.repeat === "all") {
      set({
        currentIndex: 0,
        currentSong: state.queue[0],
        currentTime: 0,
      })
    }
  },

  previous: () => {
    const state = get()
    if (state.currentTime > 3) {
      set({ currentTime: 0 })
      return
    }
    if (state.currentIndex > 0) {
      const prevIndex = state.currentIndex - 1
      set({
        currentIndex: prevIndex,
        currentSong: state.queue[prevIndex],
        currentTime: 0,
      })
    } else if (state.repeat === "all") {
      const lastIndex = state.queue.length - 1
      set({
        currentIndex: lastIndex,
        currentSong: state.queue[lastIndex],
        currentTime: 0,
      })
    }
  },

  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  toggleShuffle: () => {
    const state = get()
    if (state.shuffle) {
      // Restore original order
      set({ shuffle: false })
    } else {
      // Shuffle queue
      const shuffled = [...state.queue].sort(() => Math.random() - 0.5)
      const currentSongIndex = shuffled.findIndex(
        (s) => s.id === state.currentSong?.id
      )
      set({
        shuffle: true,
        queue: shuffled,
        currentIndex: currentSongIndex,
      })
    }
  },
  toggleRepeat: () =>
    set((state) => {
      if (state.repeat === "off") return { repeat: "all" }
      if (state.repeat === "all") return { repeat: "one" }
      return { repeat: "off" }
    }),
  clearQueue: () => set({ queue: [], currentIndex: -1 }),
}))

