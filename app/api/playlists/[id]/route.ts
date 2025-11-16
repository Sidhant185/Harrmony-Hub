import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.id },
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
                // uploaderId NOT included
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    })

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      )
    }

    // Check if playlist is public or belongs to user
    const session = await getServerSession(authOptions)
    if (!playlist.isPublic && playlist.userId !== session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    return NextResponse.json({ playlist })
  } catch (error) {
    console.error("Error fetching playlist:", error)
    return NextResponse.json(
      { error: "Failed to fetch playlist" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const { name, description, isPublic, coverArt } = await req.json()

    const updated = await prisma.playlist.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
        ...(coverArt !== undefined && { coverArt }),
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
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ playlist: updated })
  } catch (error) {
    console.error("Error updating playlist:", error)
    return NextResponse.json(
      { error: "Failed to update playlist" },
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

    await prisma.playlist.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Playlist deleted successfully" })
  } catch (error) {
    console.error("Error deleting playlist:", error)
    return NextResponse.json(
      { error: "Failed to delete playlist" },
      { status: 500 }
    )
  }
}

