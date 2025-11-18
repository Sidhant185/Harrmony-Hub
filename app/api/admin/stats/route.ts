import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    await requireAdmin(session)

    const [
      totalUsers,
      totalSongs,
      totalPlaylists,
      totalLikes,
      totalPlayHistory,
      recentUsers,
      topSongs,
      topGenres,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.song.count(),
      prisma.playlist.count(),
      prisma.like.count(),
      prisma.playHistory.count(),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      }),
      prisma.song.findMany({
        take: 10,
        orderBy: { playCount: "desc" },
        select: {
          id: true,
          title: true,
          artist: true,
          playCount: true,
          coverArt: true,
        },
      }),
      prisma.song.groupBy({
        by: ["genre"],
        where: { genre: { not: null } },
        _count: { genre: true },
        orderBy: { _count: { genre: "desc" } },
        take: 10,
      }),
    ])

    // Calculate growth metrics (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
      newUsersLast30Days,
      newSongsLast30Days,
      newPlaylistsLast30Days,
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.song.count({
        where: { uploadedAt: { gte: thirtyDaysAgo } },
      }),
      prisma.playlist.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
    ])

    // Calculate total listening time
    const playHistoryWithSongs = await prisma.playHistory.findMany({
      include: {
        song: {
          select: { duration: true },
        },
      },
    })
    const totalListeningTime = playHistoryWithSongs.reduce(
      (total, history) => total + (history.song.duration || 0),
      0
    )

    return NextResponse.json({
      overview: {
        totalUsers,
        totalSongs,
        totalPlaylists,
        totalLikes,
        totalPlayHistory,
        totalListeningTime,
      },
      growth: {
        newUsersLast30Days,
        newSongsLast30Days,
        newPlaylistsLast30Days,
      },
      recentUsers,
      topSongs,
      topGenres: topGenres.map((g) => ({
        genre: g.genre,
        count: g._count.genre,
      })),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch admin stats" },
      { status: 401 }
    )
  }
}

