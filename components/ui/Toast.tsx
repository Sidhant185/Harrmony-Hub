"use client"

import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { useEffect } from "react"

export type ToastType = "success" | "error" | "info"

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
  duration?: number
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const colorMap = {
  success: "bg-primary/10 text-primary border-primary/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const Icon = iconMap[type]

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border animate-slide-down ${colorMap[type]}`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

