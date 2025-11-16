import { UploadForm } from "@/components/upload/UploadForm"
import { Music } from "lucide-react"

export default function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Music className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Upload Your Music</h1>
          <p className="text-muted-foreground">
            Share your music anonymously with the world. Your identity will never be shown.
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <UploadForm />
        </div>
      </div>
    </div>
  )
}

