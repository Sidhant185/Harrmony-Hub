import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const history = await prisma.playHistory.findMany({
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
            playCount: true,
          },
        },
      },
      orderBy: { playedAt: "desc" },
      take: limit,
      skip: offset,
    })

    const total = await prisma.playHistory.count({
      where: { userId: session.user.id },
    })

    return NextResponse.json({
      history,
      total,
      limit,
      offset,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch listening history" },
      { status: 500 }
    )
  }
}

