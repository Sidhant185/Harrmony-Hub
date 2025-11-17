import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const song = await prisma.song.findUnique({
      where: { id: params.id },
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

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 })
    }

    return NextResponse.json(song)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch song" },
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

    const song = await prisma.song.findUnique({
      where: { id: params.id },
      select: { uploaderId: true },
    })

    if (!song) {
      return NextResponse.json(
        { error: "Song not found" },
        { status: 404 }
      )
    }

    // Only allow deletion if user is the uploader
    if (song.uploaderId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only delete your own uploads" },
        { status: 403 }
      )
    }

    await prisma.song.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Song deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete song" },
      { status: 500 }
    )
  }
}

