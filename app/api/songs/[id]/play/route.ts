import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const songId = params.id

    // Verify song exists
    const song = await prisma.song.findUnique({
      where: { id: songId },
    })

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 })
    }

    // Increment play count and create play history entry in a transaction
    await prisma.$transaction([
      prisma.song.update({
        where: { id: songId },
        data: { playCount: { increment: 1 } },
      }),
      prisma.playHistory.create({
        data: {
          userId: session.user.id,
          songId: songId,
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to record play" },
      { status: 500 }
    )
  }
}

