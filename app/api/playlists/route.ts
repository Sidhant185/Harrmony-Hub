import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { config } from "@/lib/config"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const isPublic = searchParams.get("isPublic")

    const session = await getServerSession(authOptions)
    const currentUserId = session?.user?.id

    const where: any = {}

    if (userId) {
      where.userId = userId
    } else if (isPublic === "true") {
      where.isPublic = true
    } else if (currentUserId) {
      // Show user's playlists and public playlists
      where.OR = [
        { userId: currentUserId },
        { isPublic: true },
      ]
    } else {
      where.isPublic = true
    }

    const playlists = await prisma.playlist.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        songs: {
          include: {
            song: {
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
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ playlists })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { name, description, isPublic, coverArt } = await req.json()

    if (!name) {
      return NextResponse.json(
        { error: "Playlist name is required" },
        { status: 400 }
      )
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description: description || null,
        isPublic: isPublic ?? false,
        coverArt: coverArt || null,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        songs: {
          include: {
            song: {
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
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ playlist }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create playlist" },
      { status: 500 }
    )
  }
}

