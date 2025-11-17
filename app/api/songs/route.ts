import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { config } from "@/lib/config"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(
      parseInt(searchParams.get("limit") || String(config.api.defaultLimit)),
      config.api.maxLimit
    )
    const offset = parseInt(searchParams.get("offset") || String(config.api.defaultOffset))
    const genre = searchParams.get("genre")
    const search = searchParams.get("search")

    const where: any = {}

    if (genre) {
      where.genre = genre
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { artist: { contains: search, mode: "insensitive" } },
        { album: { contains: search, mode: "insensitive" } },
      ]
    }

    const [songs, total] = await Promise.all([
      prisma.song.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { uploadedAt: "desc" },
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
      }),
      prisma.song.count({ where }),
    ])

    return NextResponse.json({
      songs,
      total,
      limit,
      offset,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    )
  }
}

