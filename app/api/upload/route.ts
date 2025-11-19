import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { config } from "@/lib/config"
import { uploadToS3, generateS3Key } from "@/lib/s3"

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

    // Validate file type (check both MIME type and extension)
    const audioFileExtension = file.name.split(".").pop()?.toLowerCase()
    const isValidMimeType = config.upload.allowedAudioTypes.includes(file.type as any)
    const isValidExtension = audioFileExtension && config.upload.allowedAudioExtensions.includes(audioFileExtension as any)
    
    if (!isValidMimeType && !isValidExtension) {
      return NextResponse.json(
        { error: `Invalid file type. Please use MP3, WAV, OGG, M4A, AAC, FLAC, WEBM, or MP4. Detected: ${file.type || audioFileExtension || "unknown"}` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > config.upload.maxFileSize) {
      return NextResponse.json(
        { error: `File size exceeds ${Math.round(config.upload.maxFileSize / (1024 * 1024))}MB limit` },
        { status: 400 }
      )
    }

    // Get session
    const session = await getServerSession(authOptions)
    const uploaderId = session?.user?.id || null

    // Generate unique filename
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase()
    const audioFileExt = file.name.split(".").pop()
    const audioFileName = `${sanitizedTitle}_${Date.now()}.${audioFileExt}`
    
    // Upload audio file to S3
    const audioBytes = await file.arrayBuffer()
    const audioBuffer = Buffer.from(audioBytes)
    const audioS3Key = generateS3Key("audio", audioFileName)
    const audioUrl = await uploadToS3(audioBuffer, audioS3Key, file.type)

    // Upload cover art to S3 if provided
    let coverArtUrl: string | null = null
    if (coverArt && coverArt.size > 0) {
      const coverExtension = coverArt.name.split(".").pop()
      const coverFileName = `${sanitizedTitle}_cover_${Date.now()}.${coverExtension}`
      const coverBytes = await coverArt.arrayBuffer()
      const coverBuffer = Buffer.from(coverBytes)
      const coverS3Key = generateS3Key("covers", coverFileName)
      coverArtUrl = await uploadToS3(coverBuffer, coverS3Key, coverArt.type)
    }

    // Get audio duration from form data (calculated client-side)
    const durationStr = formData.get("duration") as string
    const duration = durationStr ? parseInt(durationStr, 10) : 0

    // Create song record (uploaderId stored but never exposed in responses)
    const song = await prisma.song.create({
      data: {
        title,
        artist,
        album: album || null,
        genre: genre || null,
        duration,
        filePath: audioUrl, // Store S3 URL
        coverArt: coverArtUrl, // Store S3 URL
        uploaderId, // Internal only
      },
    })

    // Return song without uploaderId
    const { uploaderId: _, ...songResponse } = song

    return NextResponse.json(
      { message: "Song uploaded successfully", song: songResponse },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to upload song" },
      { status: 500 }
    )
  }
}

