"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Music, Search, Library, Upload, User, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { usePlayerStore } from "@/lib/store/player-store"

export function Navbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { currentSong } = usePlayerStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/browse" className="flex items-center gap-2 font-bold text-xl text-white">
            <Music className="h-6 w-6 text-primary" />
            <span>HarmonyHub</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/browse"
              className="text-white/70 hover:text-white transition-colors font-medium"
            >
              Browse
            </Link>
            <Link
              href="/search"
              className="text-white/70 hover:text-white transition-colors font-medium"
            >
              Search
            </Link>
            <Link
              href="/stats"
              className="text-white/70 hover:text-white transition-colors font-medium"
            >
              Stats
            </Link>
            {session && (
              <>
                <Link
                  href="/upload"
                  className="text-white/70 hover:text-white transition-colors font-medium"
                >
                  Upload
                </Link>
                <Link
                  href="/library"
                  className="text-white/70 hover:text-white transition-colors font-medium"
                >
                  Library
                </Link>
              </>
            )}
            {currentSong && (
              <Link
                href="/player"
                className="text-white/70 hover:text-white transition-colors font-medium"
              >
                Player
              </Link>
            )}

            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 hover:bg-accent rounded-full transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            )}

            {session ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-black" />
                    </div>
                  )}
                  <span className="text-sm text-white">{session.user?.name}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/register"
                  className="px-4 py-2 border border-white/20 text-white rounded-full hover:bg-white/10 transition-colors font-medium"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-primary text-black rounded-full hover:bg-primary/90 transition-colors font-bold"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

