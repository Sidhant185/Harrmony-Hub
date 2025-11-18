import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    await requireAdmin(session)

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            playlists: true,
            likes: true,
            playHistory: true,
            uploadedSongs: true,
          },
        },
      },
    })

    return NextResponse.json({ users })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 401 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    await requireAdmin(session)

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Prevent deleting admin user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })

    if (user?.email?.toLowerCase() === "sidhantpande222@gmail.com") {
      return NextResponse.json(
        { error: "Cannot delete admin user" },
        { status: 403 }
      )
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 401 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    await requireAdmin(session)

    const body = await req.json()
    const { userId, name, email } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Prevent editing admin email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })

    if (user?.email?.toLowerCase() === "sidhantpande222@gmail.com" && email && email.toLowerCase() !== "sidhantpande222@gmail.com") {
      return NextResponse.json(
        { error: "Cannot change admin email" },
        { status: 403 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 401 }
    )
  }
}

