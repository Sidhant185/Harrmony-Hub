import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const artist = formData.get("artist") as string
    const album = formData.get("album") as string | null
    const genre = formData.get("genre") as string | null
    const coverArt = formData.get("coverArt") as File | null

    if (!file || !title || !artist) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only audio files are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      )
    }

    // Get session (optional - uploads can be anonymous)
    const session = await getServerSession(authOptions)
    const uploaderId = session?.user?.id || null

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase()
    const fileExtension = file.name.split(".").pop()
    const fileName = `${sanitizedTitle}_${timestamp}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save cover art if provided
    let coverArtPath: string | null = null
    if (coverArt && coverArt.size > 0) {
      const coverExtension = coverArt.name.split(".").pop()
      const coverFileName = `${sanitizedTitle}_cover_${timestamp}.${coverExtension}`
      const coverPath = join(uploadsDir, coverFileName)
      const coverBytes = await coverArt.arrayBuffer()
      const coverBuffer = Buffer.from(coverBytes)
      await writeFile(coverPath, coverBuffer)
      coverArtPath = `/uploads/${coverFileName}`
    }

    // Get audio duration (simplified - in production, use a library like node-ffprobe)
    // For now, we'll set a default and let the client update it
    const duration = 0 // Will be updated by client

    // Create song record (uploaderId stored but never exposed in responses)
    const song = await prisma.song.create({
      data: {
        title,
        artist,
        album: album || null,
        genre: genre || null,
        duration,
        filePath: `/uploads/${fileName}`,
        coverArt: coverArtPath,
        uploaderId, // Internal only
      },
    })

    // Return song without uploaderId
    const { uploaderId: _, ...songResponse } = song

    return NextResponse.json(
      { message: "Song uploaded successfully", song: songResponse },
      { status: 201 }
    )
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload song" },
      { status: 500 }
    )
  }
}

