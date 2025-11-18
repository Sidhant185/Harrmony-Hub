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

    if (startDate) {
      // For time periods, count plays within that period
      const playCounts = await prisma.playHistory.groupBy({
        by: ["songId"],
        where: {
          playedAt: {
            gte: startDate,
          },
        },
        _count: {
          songId: true,
        },
        orderBy: {
          _count: {
            songId: "desc",
          },
        },
        take: limit,
      })

      if (playCounts.length === 0) {
        return NextResponse.json({ songs: [], period })
      }

      const songIds = playCounts.map((pc) => pc.songId)
      const playCountMap = new Map(
        playCounts.map((pc) => [pc.songId, pc._count.songId])
      )

      // Get songs with their full data
      const songs = await prisma.song.findMany({
        where: {
          id: { in: songIds },
        },
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

      // Sort by period play count and add period play count
      const songsWithPeriodCount = songs
        .map((song) => ({
          ...song,
          periodPlayCount: playCountMap.get(song.id) || 0,
        }))
        .sort((a, b) => b.periodPlayCount - a.periodPlayCount)

      return NextResponse.json({ songs: songsWithPeriodCount, period })
    }

    // For "all" period, use total playCount
    const songs = await prisma.song.findMany({
      where: {
        playCount: {
          gt: 0, // Only songs that have been played
        },
      },
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

