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

    const [songs, total] = await Promise.all([
      prisma.song.findMany({
        take: limit,
        skip: offset,
        orderBy: { uploadedAt: "desc" },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.song.count(),
    ])

    return NextResponse.json({ songs, total })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch songs" },
      { status: 401 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    await requireAdmin(session)

    const { searchParams } = new URL(req.url)
    const songId = searchParams.get("songId")

    if (!songId) {
      return NextResponse.json(
        { error: "Song ID is required" },
        { status: 400 }
      )
    }

    await prisma.song.delete({
      where: { id: songId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete song" },
      { status: 401 }
    )
  }
}

