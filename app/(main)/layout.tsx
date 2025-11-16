"use client"

import { Navbar } from "@/components/navbar/Navbar"
import { AudioPlayer } from "@/components/player/AudioPlayer"
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useKeyboardShortcuts()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-24">{children}</main>
      <AudioPlayer />
    </div>
  )
}
