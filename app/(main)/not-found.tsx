import Link from "next/link"
import { Music } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Music className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <p className="text-white/70 mb-6">Page not found</p>
        <Link
          href="/browse"
          className="px-6 py-3 bg-primary text-black rounded-full hover:bg-primary/90 transition-colors font-bold inline-block"
        >
          Go to Browse
        </Link>
      </div>
    </div>
  )
}

