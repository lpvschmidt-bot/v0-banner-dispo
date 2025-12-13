import { NextResponse } from "next/server"
import { list } from "@vercel/blob"
import fs from "fs/promises"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")

// Check if Vercel Blob is available
const isBlobAvailable = () => {
  return process.env.BLOB_READ_WRITE_TOKEN !== undefined
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get("year")
  const code = searchParams.get("code")

  // Überprüfen Sie das Codewort
  if (code !== "banner2024") {
    return NextResponse.json({ error: "Ungültiges Codewort" }, { status: 403 })
  }

  if (!year) {
    return NextResponse.json({ error: "Year parameter is required" }, { status: 400 })
  }

  try {
    if (isBlobAvailable()) {
      // Use Vercel Blob storage
      const { blobs } = await list()
      const weekPattern = new RegExp(`banner-data-${year}-KW(\\d{2})\\.json`)
      const existingWeeks = blobs
        .map((blob) => {
          const match = blob.pathname.match(weekPattern)
          return match ? Number.parseInt(match[1]) : null
        })
        .filter((week): week is number => week !== null)

      // Generate all weeks for the year
      const allWeeks = Array.from({ length: 53 }, (_, i) => i + 1)

      // Mark weeks as existing or not
      const availableWeeks = allWeeks.map((week) => ({
        week: week.toString().padStart(2, "0"),
        exists: existingWeeks.includes(week),
      }))

      return NextResponse.json(availableWeeks)
    } else {
      // Fallback to local file storage
      try {
        await fs.access(DATA_DIR)
      } catch {
        await fs.mkdir(DATA_DIR, { recursive: true })
        return NextResponse.json(
          Array.from({ length: 53 }, (_, i) => ({
            week: (i + 1).toString().padStart(2, "0"),
            exists: false,
          })),
        )
      }

      const files = await fs.readdir(DATA_DIR)
      const weekPattern = new RegExp(`banner-data-${year}-KW(\\d{2})\\.json$`)
      const existingWeeks = files
        .map((file) => {
          const match = file.match(weekPattern)
          return match ? Number.parseInt(match[1]) : null
        })
        .filter((week): week is number => week !== null)

      // Generate all weeks for the year
      const allWeeks = Array.from({ length: 53 }, (_, i) => i + 1)

      // Mark weeks as existing or not
      const availableWeeks = allWeeks.map((week) => ({
        week: week.toString().padStart(2, "0"),
        exists: existingWeeks.includes(week),
      }))

      return NextResponse.json(availableWeeks)
    }
  } catch (error) {
    console.error("Error fetching available weeks:", error)
    return NextResponse.json({ error: "Failed to fetch available weeks" }, { status: 500 })
  }
}

