"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { isAdmin } from "@/lib/admin"
import {
  Shield,
  Users,
  Music,
  ListMusic,
  TrendingUp,
  BarChart3,
  Trash2,
  Edit,
  X,
  Check,
  Loader2,
} from "lucide-react"
import { useToast } from "@/components/ui/ToastProvider"
import { ConfirmationModal } from "@/components/ui/ConfirmationModal"
import { formatDuration } from "@/lib/utils"

interface AdminStats {
  overview: {
    totalUsers: number
    totalSongs: number
    totalPlaylists: number
    totalLikes: number
    totalPlayHistory: number
    totalListeningTime: number
  }
  growth: {
    newUsersLast30Days: number
    newSongsLast30Days: number
    newPlaylistsLast30Days: number
  }
  recentUsers: Array<{
    id: string
    name: string | null
    email: string
    image: string | null
    createdAt: string
  }>
  topSongs: Array<{
    id: string
    title: string
    artist: string
    playCount: number
    coverArt: string | null
  }>
  topGenres: Array<{
    genre: string | null
    count: number
  }>
}

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: string
  updatedAt: string
  _count: {
    playlists: number
    likes: number
    playHistory: number
    uploadedSongs: number
  }
}

interface Song {
  id: string
  title: string
  artist: string
  album: string | null
  duration: number
  filePath: string
  coverArt: string | null
  genre: string | null
  playCount: number
  uploadedAt: string
  uploader: {
    id: string
    name: string | null
    email: string
  } | null
}

interface Playlist {
  id: string
  name: string
  description: string | null
  coverArt: string | null
  isPublic: boolean
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  songs: Array<{
    song: {
      id: string
      title: string
      artist: string
    }
  }>
}

type Tab = "overview" | "users" | "songs" | "playlists"

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    type: "user" | "song" | "playlist" | null
    id: string | null
    name?: string
  }>({
    isOpen: false,
    type: null,
    id: null,
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session || !isAdmin(session.user?.email)) {
      router.push("/browse")
      return
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, router])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === "overview") {
        const res = await fetch("/api/admin/stats")
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } else if (activeTab === "users") {
        const res = await fetch("/api/admin/users")
        if (res.ok) {
          const data = await res.json()
          setUsers(data.users)
        }
      } else if (activeTab === "songs") {
        const res = await fetch("/api/admin/songs?limit=100")
        if (res.ok) {
          const data = await res.json()
          setSongs(data.songs)
        }
      } else if (activeTab === "playlists") {
        const res = await fetch("/api/admin/playlists?limit=100")
        if (res.ok) {
          const data = await res.json()
          setPlaylists(data.playlists)
        }
      }
    } catch (error) {
      showToast("Failed to fetch data", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session && isAdmin(session.user?.email)) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const handleDelete = async () => {
    if (!deleteConfirm.id || !deleteConfirm.type) return

    try {
      let url = ""
      if (deleteConfirm.type === "user") {
        url = `/api/admin/users?userId=${deleteConfirm.id}`
      } else if (deleteConfirm.type === "song") {
        url = `/api/admin/songs?songId=${deleteConfirm.id}`
      } else if (deleteConfirm.type === "playlist") {
        url = `/api/admin/playlists?playlistId=${deleteConfirm.id}`
      }

      const res = await fetch(url, { method: "DELETE" })
      if (res.ok) {
        showToast(`${deleteConfirm.type} deleted successfully`, "success")
        setDeleteConfirm({ isOpen: false, type: null, id: null })
        fetchData()
      } else {
        const data = await res.json()
        showToast(data.error || "Failed to delete", "error")
      }
    } catch (error) {
      showToast("Failed to delete", "error")
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user.id)
    setEditName(user.name || "")
    setEditEmail(user.email)
  }

  const handleSaveUser = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: editName.trim() || null,
          email: editEmail.trim(),
        }),
      })

      if (res.ok) {
        showToast("User updated successfully", "success")
        setEditingUser(null)
        fetchData()
      } else {
        const data = await res.json()
        showToast(data.error || "Failed to update user", "error")
      }
    } catch (error) {
      showToast("Failed to update user", "error")
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditName("")
    setEditEmail("")
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session || !isAdmin(session.user?.email)) {
    return null
  }

  const tabs: Array<{ id: Tab; label: string; icon: any }> = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "songs", label: "Songs", icon: Music },
    { id: "playlists", label: "Playlists", icon: ListMusic },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/20 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/70">Manage your platform</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-primary text-black"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="bg-[#121212] rounded-lg border border-white/10 p-6">
          {activeTab === "overview" && stats && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <div className="bg-[#181818] rounded-lg p-4 border border-white/10">
                  <div className="text-white/70 text-sm mb-1">Total Users</div>
                  <div className="text-2xl font-bold text-white">{stats.overview.totalUsers}</div>
                  <div className="text-xs text-primary mt-1">
                    +{stats.growth.newUsersLast30Days} this month
                  </div>
                </div>
                <div className="bg-[#181818] rounded-lg p-4 border border-white/10">
                  <div className="text-white/70 text-sm mb-1">Total Songs</div>
                  <div className="text-2xl font-bold text-white">{stats.overview.totalSongs}</div>
                  <div className="text-xs text-primary mt-1">
                    +{stats.growth.newSongsLast30Days} this month
                  </div>
                </div>
                <div className="bg-[#181818] rounded-lg p-4 border border-white/10">
                  <div className="text-white/70 text-sm mb-1">Playlists</div>
                  <div className="text-2xl font-bold text-white">{stats.overview.totalPlaylists}</div>
                  <div className="text-xs text-primary mt-1">
                    +{stats.growth.newPlaylistsLast30Days} this month
                  </div>
                </div>
                <div className="bg-[#181818] rounded-lg p-4 border border-white/10">
                  <div className="text-white/70 text-sm mb-1">Total Likes</div>
                  <div className="text-2xl font-bold text-white">{stats.overview.totalLikes}</div>
                </div>
                <div className="bg-[#181818] rounded-lg p-4 border border-white/10">
                  <div className="text-white/70 text-sm mb-1">Plays</div>
                  <div className="text-2xl font-bold text-white">{stats.overview.totalPlayHistory}</div>
                </div>
                <div className="bg-[#181818] rounded-lg p-4 border border-white/10">
                  <div className="text-white/70 text-sm mb-1">Listening Time</div>
                  <div className="text-xl font-bold text-white">
                    {formatDuration(stats.overview.totalListeningTime)}
                  </div>
                </div>
              </div>

              {/* Top Songs */}
              {stats.topSongs.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Songs
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.topSongs.map((song, index) => (
                      <div
                        key={song.id}
                        className="bg-[#181818] rounded-lg p-4 border border-white/10 flex items-center gap-3"
                      >
                        <div className="text-2xl font-bold text-primary w-8">#{index + 1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{song.title}</div>
                          <div className="text-sm text-white/70 truncate">{song.artist}</div>
                          <div className="text-xs text-white/50 mt-1">{song.playCount} plays</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Genres */}
              {stats.topGenres.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Top Genres</h2>
                  <div className="flex flex-wrap gap-2">
                    {stats.topGenres.map((genre, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium"
                      >
                        {genre.genre} ({genre.count})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Users */}
              {stats.recentUsers.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Recent Users</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.recentUsers.map((user) => (
                      <div
                        key={user.id}
                        className="bg-[#181818] rounded-lg p-4 border border-white/10 flex items-center gap-3"
                      >
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || "User"}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <Users className="h-5 w-5 text-black" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">
                            {user.name || "No name"}
                          </div>
                          <div className="text-sm text-white/70 truncate">{user.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/70 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Stats</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Joined</th>
                    <th className="text-right py-3 px-4 text-white/70 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name || "User"}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <Users className="h-4 w-4 text-black" />
                            </div>
                          )}
                          <span className="text-white">{user.name || "No name"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white/70 text-sm">{user.email}</td>
                      <td className="py-3 px-4 text-white/70 text-sm">
                        <div className="flex flex-col gap-1">
                          <span>Songs: {user._count.uploadedSongs}</span>
                          <span>Playlists: {user._count.playlists}</span>
                          <span>Likes: {user._count.likes}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white/70 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {editingUser === user.id ? (
                            <>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Name"
                                className="px-2 py-1 bg-[#181818] border border-white/20 rounded text-white text-sm w-32"
                              />
                              <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                placeholder="Email"
                                className="px-2 py-1 bg-[#181818] border border-white/20 rounded text-white text-sm w-40"
                              />
                              <button
                                onClick={() => handleSaveUser(user.id)}
                                className="p-1.5 text-primary hover:bg-white/10 rounded transition-colors"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1.5 text-white/70 hover:bg-white/10 rounded transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-1.5 text-white/70 hover:bg-white/10 rounded transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              {user.email.toLowerCase() !== "sidhantpande222@gmail.com" && (
                                <button
                                  onClick={() =>
                                    setDeleteConfirm({
                                      isOpen: true,
                                      type: "user",
                                      id: user.id,
                                      name: user.name || user.email,
                                    })
                                  }
                                  className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "songs" && (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Song</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Artist</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Uploader</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Plays</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Uploaded</th>
                    <th className="text-right py-3 px-4 text-white/70 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map((song) => (
                    <tr key={song.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {song.coverArt ? (
                            <img
                              src={song.coverArt}
                              alt={song.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
                              <Music className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <span className="text-white">{song.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white/70">{song.artist}</td>
                      <td className="py-3 px-4 text-white/70 text-sm">
                        {song.uploader?.name || song.uploader?.email || "Unknown"}
                      </td>
                      <td className="py-3 px-4 text-white/70">{song.playCount}</td>
                      <td className="py-3 px-4 text-white/70 text-sm">
                        {new Date(song.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                isOpen: true,
                                type: "song",
                                id: song.id,
                                name: song.title,
                              })
                            }
                            className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "playlists" && (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Playlist</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Owner</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Songs</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Visibility</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Created</th>
                    <th className="text-right py-3 px-4 text-white/70 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {playlists.map((playlist) => (
                    <tr key={playlist.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {playlist.coverArt ? (
                            <img
                              src={playlist.coverArt}
                              alt={playlist.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
                              <ListMusic className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <div>
                            <div className="text-white font-medium">{playlist.name}</div>
                            {playlist.description && (
                              <div className="text-xs text-white/50 truncate max-w-xs">
                                {playlist.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white/70 text-sm">
                        {playlist.user.name || playlist.user.email}
                      </td>
                      <td className="py-3 px-4 text-white/70">{playlist.songs.length}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            playlist.isPublic
                              ? "bg-green-500/20 text-green-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {playlist.isPublic ? "Public" : "Private"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white/70 text-sm">
                        {new Date(playlist.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                isOpen: true,
                                type: "playlist",
                                id: playlist.id,
                                name: playlist.name,
                              })
                            }
                            className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, type: null, id: null })}
        onConfirm={handleDelete}
        title={`Delete ${deleteConfirm.type || "item"}`}
        message={`Are you sure you want to delete ${deleteConfirm.name || "this item"}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

