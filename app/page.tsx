"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Music } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  
  useEffect(() => {
    // Use push instead of replace for faster navigation
    router.push("/browse")
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Music className="h-12 w-12 text-primary animate-pulse" />
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping" />
        </div>
        <div className="text-white/70 text-sm font-medium">Loading HarmonyHub...</div>
      </div>
    </div>
  )
}

