"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Music, Search, Library, Upload, User, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

export function Navbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="sticky top-0 z-40 bg-card/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/browse" className="flex items-center gap-2 font-bold text-xl">
            <Music className="h-6 w-6 text-primary" />
            <span>HarmonyHub</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/browse"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/search"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Search
            </Link>
            <Link
              href="/upload"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Upload
            </Link>
            {session && (
              <>
                <Link
                  href="/library"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Library
                </Link>
                <Link
                  href="/my-uploads"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  My Uploads
                </Link>
              </>
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
                <div className="flex items-center gap-2">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <span className="text-sm">{session.user?.name}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 hover:bg-accent rounded-full transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

