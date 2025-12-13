import { NextResponse } from "next/server"
import { getJsonData, saveJsonData, restoreBackup, deleteJsonData } from "@/app/lib/blob-storage"

export const dynamic = "force_dynamic"

// Hilfsfunktion zur Überprüfung des Codeworts
function validateCode(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (code !== "banner2024") {
    return false
  }
  return true
}

export async function GET(request: Request) {
  // Überprüfen Sie das Codewort
  if (!validateCode(request)) {
    return NextResponse.json({ error: "Ungültiges Codewort" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const year = searchParams.get("year")
  const week = searchParams.get("week")

  if (!year || !week) {
    return NextResponse.json({ error: "Jahr und Woche sind erforderlich" }, { status: 400 })
  }

  try {
    const data = await getJsonData(year, week)
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching JSON data:", error)
    return NextResponse.json({ error: "Fehler beim Abrufen der Daten" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  // Überprüfen Sie das Codewort
  if (!validateCode(request)) {
    return NextResponse.json({ error: "Ungültiges Codewort" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const year = searchParams.get("year")
  const week = searchParams.get("week")

  if (!year || !week) {
    return NextResponse.json({ error: "Jahr und Woche sind erforderlich" }, { status: 400 })
  }

  try {
    const data = await request.json()
    if (!Array.isArray(data)) {
      throw new Error("Ungültiges Datenformat. Ein Array wird erwartet.")
    }

    const savedUrl = await saveJsonData(year, week, data)
    const savedData = await getJsonData(year, week)
    return NextResponse.json({ success: true, data: savedData, savedUrl })
  } catch (error) {
    console.error("Error saving JSON data:", error)
    return NextResponse.json({ error: "Fehler beim Speichern der Daten" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  // Überprüfen Sie das Codewort
  if (!validateCode(request)) {
    return NextResponse.json({ error: "Ungültiges Codewort" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const year = searchParams.get("year")
  const week = searchParams.get("week")

  if (!year || !week) {
    return NextResponse.json({ error: "Jahr und Woche sind erforderlich" }, { status: 400 })
  }

  try {
    const restoredData = await restoreBackup(year, week)
    return NextResponse.json(restoredData)
  } catch (error) {
    console.error("Error restoring backup:", error)
    return NextResponse.json({ error: "Fehler beim Wiederherstellen des Backups" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  // Überprüfen Sie das Codewort
  if (!validateCode(request)) {
    return NextResponse.json({ error: "Ungültiges Codewort" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const year = searchParams.get("year")
  const week = searchParams.get("week")

  if (!year || !week) {
    return NextResponse.json({ error: "Jahr und Woche sind erforderlich" }, { status: 400 })
  }

  try {
    const deletedFiles = await deleteJsonData(year, week)
    return NextResponse.json({ success: true, message: "Daten erfolgreich gelöscht", deletedFiles })
  } catch (error) {
    console.error("Error deleting JSON data:", error)
    return NextResponse.json({ error: "Fehler beim Löschen der Daten" }, { status: 500 })
  }
}

