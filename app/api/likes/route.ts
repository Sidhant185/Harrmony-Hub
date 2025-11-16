import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { songId } = await req.json()

    if (!songId) {
      return NextResponse.json(
        { error: "Song ID is required" },
        { status: 400 }
      )
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_songId: {
          userId: session.user.id,
          songId,
        },
      },
    })

    if (existingLike) {
      return NextResponse.json({ message: "Song already liked", liked: true })
    }

    await prisma.like.create({
      data: {
        userId: session.user.id,
        songId,
      },
    })

    return NextResponse.json({ message: "Song liked", liked: true })
  } catch (error) {
    console.error("Error liking song:", error)
    return NextResponse.json(
      { error: "Failed to like song" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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

    await prisma.like.delete({
      where: {
        userId_songId: {
          userId: session.user.id,
          songId,
        },
      },
    })

    return NextResponse.json({ message: "Song unliked", liked: false })
  } catch (error) {
    console.error("Error unliking song:", error)
    return NextResponse.json(
      { error: "Failed to unlike song" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const songId = searchParams.get("songId")

    if (songId) {
      const like = await prisma.like.findUnique({
        where: {
          userId_songId: {
            userId: session.user.id,
            songId,
          },
        },
      })
      return NextResponse.json({ liked: !!like })
    }

    // Get all liked songs
    const likes = await prisma.like.findMany({
      where: { userId: session.user.id },
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
            uploadedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ likes })
  } catch (error) {
    console.error("Error fetching likes:", error)
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 }
    )
  }
}

