import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")
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
          uploadedAt: true,
          // uploaderId is NOT included - anonymous uploads
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
    console.error("Error fetching songs:", error)
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    )
  }
}

