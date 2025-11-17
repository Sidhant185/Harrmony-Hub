import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get listening statistics
    const [playHistory, likedSongs, uploadedSongs] = await Promise.all([
      prisma.playHistory.findMany({
        where: { userId },
        include: {
          song: {
            select: {
              duration: true,
            },
          },
        },
        orderBy: { playedAt: "desc" },
        take: 50,
      }),
      prisma.like.count({
        where: { userId },
      }),
      prisma.song.count({
        where: { uploaderId: userId },
      }),
    ])

    // Calculate total listening time (in seconds)
    const totalListeningTime = playHistory.reduce(
      (total, history) => total + (history.song.duration || 0),
      0
    )

    // Get unique songs played count
    const uniqueSongsPlayed = await prisma.playHistory.findMany({
      where: { userId },
      distinct: ["songId"],
      select: { songId: true },
    })

    return NextResponse.json({
      user,
      stats: {
        totalListeningTime,
        totalSongsPlayed: playHistory.length,
        uniqueSongsPlayed: uniqueSongsPlayed.length,
        likedSongsCount: likedSongs,
        uploadedSongsCount: uploadedSongs,
      },
      recentHistory: playHistory.slice(0, 20).map((h) => ({
        id: h.id,
        songId: h.songId,
        playedAt: h.playedAt,
        song: h.song,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

