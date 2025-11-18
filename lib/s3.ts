import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

// Check if Cloudflare R2 is configured
const isR2Configured = !!(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
)

// Initialize R2 client (S3-compatible) only if configured
const r2Client = isR2Configured
  ? new S3Client({
      region: "auto", // R2 uses "auto" as region
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
    })
  : null

const BUCKET_NAME = process.env.R2_BUCKET_NAME || ""
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || ""
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "" // Optional custom domain

/**
 * Upload a file to Cloudflare R2 (or local storage if R2 not configured)
 */
export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  // Fallback to local storage for development
  if (!isR2Configured || !r2Client) {
    try {
      const uploadsDir = join(process.cwd(), "public", "uploads")
      await mkdir(uploadsDir, { recursive: true })
      const filePath = join(uploadsDir, fileName)
      await writeFile(filePath, file)
      return `/uploads/${fileName}`
    } catch (error: any) {
      console.error("Error saving to local storage:", error)
      throw new Error(`Failed to save file locally: ${error.message || "Unknown error"}`)
    }
  }

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file,
      ContentType: contentType,
    })

    await r2Client.send(command)

    // Return the public URL
    // If custom domain is configured, use it; otherwise use R2.dev subdomain
    if (R2_PUBLIC_URL) {
      return `https://${R2_PUBLIC_URL}/${fileName}`
    }
    // R2.dev public URL format (requires enabling in R2 dashboard):
    // https://<bucket-name>.<account-id>.r2.dev/<file>
    return `https://${BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.dev/${fileName}`
  } catch (error: any) {
    console.error("Error uploading to R2:", error)
    throw new Error(`Failed to upload file to R2: ${error.message || "Unknown error"}`)
  }
}

/**
 * Get a presigned URL for private files (if needed in future)
 */
export async function getPresignedUrl(fileName: string, expiresIn: number = 3600): Promise<string> {
  if (!isR2Configured || !r2Client) {
    // Fallback to local URL
    return `/uploads/${fileName}`
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    })

    const url = await getSignedUrl(r2Client, command, { expiresIn })
    return url
  } catch (error) {
    console.error("Error generating presigned URL:", error)
    throw new Error("Failed to generate presigned URL")
  }
}

/**
 * Generate R2 key (path) for a file
 */
export function generateS3Key(prefix: string, fileName: string): string {
  const timestamp = Date.now()
  const sanitized = fileName.replace(/[^a-z0-9._-]/gi, "_").toLowerCase()
  return `${prefix}/${timestamp}_${sanitized}`
}

/**
 * Check if a URL is an R2 URL (for migration purposes)
 */
export function isS3Url(url: string): boolean {
  if (!url) return false
  return url.startsWith("https://") && (
    url.includes("r2.cloudflarestorage.com") || 
    url.includes(".r2.dev") ||
    !!(R2_PUBLIC_URL && url.includes(R2_PUBLIC_URL))
  )
}

/**
 * Get the full URL for a file path (handles both local and R2 paths)
 */
export function getFileUrl(filePath: string | null | undefined): string | null {
  if (!filePath) return null
  
  // If it's already a full URL (R2), return as is
  if (filePath.startsWith("https://")) {
    return filePath
  }
  
  // If it's a local path starting with /, it's from old uploads
  // In production, these should be migrated to R2
  // For now, we'll return the path as-is (Vercel will serve from public folder)
  if (filePath.startsWith("/")) {
    return filePath
  }
  
  return filePath
}

