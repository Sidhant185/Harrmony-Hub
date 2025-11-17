import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ songs: [], playlists: [] })
    }

    const searchTerm = q.trim()

    const [songs, playlists] = await Promise.all([
      prisma.song.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { artist: { contains: searchTerm, mode: "insensitive" } },
            { album: { contains: searchTerm, mode: "insensitive" } },
            { genre: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 20,
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
      prisma.playlist.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
          isPublic: true,
        },
        take: 10,
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json({ songs, playlists })
  } catch (error) {
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    )
  }
}

