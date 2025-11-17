"use client"

import { Navbar } from "@/components/navbar/Navbar"
import { AudioPlayer } from "@/components/player/AudioPlayer"
import { ToastProvider } from "@/components/ui/ToastProvider"
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useKeyboardShortcuts()

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar />
        <main className="flex-1 pb-24 bg-black">{children}</main>
        <AudioPlayer />
      </div>
    </ToastProvider>
  )
}
