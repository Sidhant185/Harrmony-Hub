"use client";

import Link from "next/link";
import Image from "next/image";
import { Music, Share2, MoreVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/ToastProvider";

interface PlaylistCardProps {
  playlist: {
    id: string;
    name: string;
    description?: string;
    coverArt?: string;
    isPublic: boolean;
    songs?: Array<{ song: any }>;
    user?: {
      name?: string;
    };
  };
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  const songCount = playlist.songs?.length || 0;
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/playlist/${playlist.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: playlist.name,
          text: `Check out "${playlist.name}" playlist on HarmonyHub!`,
          url: shareUrl,
        });
      } catch (error) {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
    setShowMenu(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast("Link copied to clipboard!", "success");
      })
      .catch(() => {
        showToast("Failed to copy link", "error");
      });
  };

  return (
    <Link href={`/playlist/${playlist.id}`}>
      <div className="group bg-[#181818] rounded-lg p-4 hover:bg-[#282828] transition-colors cursor-pointer relative">
        <div className="relative aspect-square mb-3 rounded-md overflow-hidden bg-[#333]">
          {playlist.coverArt ? (
            <Image
              src={playlist.coverArt}
              alt={playlist.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="h-12 w-12 text-white/50" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-medium truncate text-white">{playlist.name}</h3>
          {playlist.description && (
            <p className="text-sm text-white/70 line-clamp-2">
              {playlist.description}
            </p>
          )}
          <p className="text-xs text-white/70">
            {songCount} {songCount === 1 ? "song" : "songs"}
            {playlist.user?.name && ` • by ${playlist.user.name}`}
          </p>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/70"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute top-full right-0 mt-2 bg-[#282828] rounded-lg shadow-xl py-2 min-w-[180px] z-50 border border-white/10">
                <button
                  onClick={handleShare}
                  className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
