import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "all" // week, month, year, all
    const limit = parseInt(searchParams.get("limit") || "20")

    const now = new Date()
    let startDate: Date | undefined

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = undefined
    }

    let where: any = {}

    if (startDate) {
      // Get songs that have been played in the period
      const playHistorySongs = await prisma.playHistory.findMany({
        where: {
          playedAt: {
            gte: startDate,
          },
        },
        select: {
          songId: true,
        },
        distinct: ["songId"],
      })

      const songIds = playHistorySongs.map((ph) => ph.songId)

      if (songIds.length === 0) {
        return NextResponse.json({ songs: [], period })
      }

      where.id = { in: songIds }
    }

    // Get top songs by play count
    const songs = await prisma.song.findMany({
      where,
      take: limit,
      orderBy: { playCount: "desc" },
      select: {
        id: true,
        title: true,
        artist: true,
        album: true,
        duration: true,
        filePath: true,
        coverArt: true,
        genre: true,
        playCount: true,
        uploadedAt: true,
      },
    })

    return NextResponse.json({ songs, period })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch top songs" },
      { status: 500 }
    )
  }
}

