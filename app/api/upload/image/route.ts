import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("file") as File[]
    const singleFile = formData.get("file") as File | null
    const oldImageUrl = formData.get("oldImageUrl") as string | null
    const folder = (formData.get("folder") as string | null) === "hero" ? "hero" : "products"

    const fileList = files.length > 0 ? files : singleFile ? [singleFile] : []

    if (fileList.length === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const supabase = await createClient({ role: "service_role" })
    const urls: string[] = []

    for (const file of fileList) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." },
          { status: 400 }
        )
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File size exceeds 5MB limit." },
          { status: 400 }
        )
      }

      const fileExt = file.name.split(".").pop()
      const fileName = `${randomUUID()}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        return NextResponse.json(
          { error: "Failed to upload image: " + uploadError.message },
          { status: 500 }
        )
      }

      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(filePath)
      urls.push(publicUrl)
    }

    if (fileList.length === 1 && oldImageUrl) {
      try {
        const urlParts = oldImageUrl.split("/product-images/")
        if (urlParts.length > 1) {
          const oldFilePath = urlParts[1].split("?")[0]
          await supabase.storage.from("product-images").remove([oldFilePath])
        }
      } catch (deleteError) {
        console.error("Error deleting old image:", deleteError)
      }
    }

    if (urls.length === 1) {
      return NextResponse.json({ url: urls[0] })
    }
    return NextResponse.json({ urls })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
