"use client"

import { X, AlertTriangle } from "lucide-react"
import { useEffect } from "react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "default"
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmationModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#121212] rounded-lg w-full max-w-md m-4 shadow-2xl border border-white/10 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            {variant === "danger" && (
              <div className="p-2 bg-red-500/10 rounded-full flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-white/70">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-3 justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-white/20 rounded-full hover:bg-white/10 transition-colors text-white font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className={`px-4 py-2 rounded-full font-medium transition-all hover:scale-105 ${
                variant === "danger"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-primary text-black hover:bg-primary/90"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

