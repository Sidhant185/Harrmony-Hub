import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const playlist = await prisma.playlist.findUnique({
      where: { id: params.id },
    })

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      )
    }

    if (playlist.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const { songId } = await req.json()

    if (!songId) {
      return NextResponse.json(
        { error: "Song ID is required" },
        { status: 400 }
      )
    }

    // Get current max order
    const maxOrder = await prisma.playlistSong.findFirst({
      where: { playlistId: params.id },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const order = (maxOrder?.order ?? -1) + 1

    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlistId: params.id,
        songId,
        order,
      },
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
          },
        },
      },
    })

    return NextResponse.json({ playlistSong }, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Song already in playlist" },
        { status: 400 }
      )
    }
    console.error("Error adding song to playlist:", error)
    return NextResponse.json(
      { error: "Failed to add song to playlist" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const playlist = await prisma.playlist.findUnique({
      where: { id: params.id },
    })

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      )
    }

    if (playlist.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const songId = searchParams.get("songId")

    if (!songId) {
      return NextResponse.json(
        { error: "Song ID is required" },
        { status: 400 }
      )
    }

    await prisma.playlistSong.delete({
      where: {
        playlistId_songId: {
          playlistId: params.id,
          songId,
        },
      },
    })

    return NextResponse.json({ message: "Song removed from playlist" })
  } catch (error) {
    console.error("Error removing song from playlist:", error)
    return NextResponse.json(
      { error: "Failed to remove song from playlist" },
      { status: 500 }
    )
  }
}

