import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    await requireAdmin(session)

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const [playlists, total] = await Promise.all([
      prisma.playlist.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          songs: {
            include: {
              song: {
                select: {
                  id: true,
                  title: true,
                  artist: true,
                },
              },
            },
          },
        },
      }),
      prisma.playlist.count(),
    ])

    return NextResponse.json({ playlists, total })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch playlists" },
      { status: 401 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    await requireAdmin(session)

    const { searchParams } = new URL(req.url)
    const playlistId = searchParams.get("playlistId")

    if (!playlistId) {
      return NextResponse.json(
        { error: "Playlist ID is required" },
        { status: 400 }
      )
    }

    await prisma.playlist.delete({
      where: { id: playlistId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete playlist" },
      { status: 401 }
    )
  }
}

