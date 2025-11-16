import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const songs = await prisma.song.findMany({
      where: {
        uploaderId: session.user.id,
      },
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
        // uploaderId included here since user is viewing their own uploads
        uploaderId: true,
      },
    })

    return NextResponse.json({ songs })
  } catch (error) {
    console.error("Error fetching user uploads:", error)
    return NextResponse.json(
      { error: "Failed to fetch uploads" },
      { status: 500 }
    )
  }
}

