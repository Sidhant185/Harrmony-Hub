import { Music, Heart, Upload, Search, Play } from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
  icon?: "music" | "heart" | "upload" | "search" | "play"
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
}

const iconMap = {
  music: Music,
  heart: Heart,
  upload: Upload,
  search: Search,
  play: Play,
}

export function EmptyState({ icon = "music", title, description, action }: EmptyStateProps) {
  const Icon = iconMap[icon]

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-6 bg-white/5 rounded-full mb-6">
        <Icon className="h-12 w-12 text-white/50" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      {description && <p className="text-white/70 mb-6 max-w-md">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="px-6 py-3 bg-primary text-black rounded-full font-bold hover:bg-primary/90 transition-all hover:scale-105"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}

