"use server"

import fs from "fs/promises"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "banner-data.json")
const BACKUP_FILE = path.join(DATA_DIR, "banner-data-backup.json")

async function ensureDirectoryExists() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true })
      // Create an empty JSON array if the file doesn't exist
      await fs.writeFile(DATA_FILE, "[]", "utf-8")
    } catch (error) {
      console.error("Error creating directory or initial file:", error)
      throw new Error("Konnte Datenverzeichnis nicht erstellen")
    }
  }
}

export async function getJsonData() {
  await ensureDirectoryExists()
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8")
    return JSON.parse(data || "[]")
  } catch (error) {
    console.error("Error reading JSON data:", error)
    // Return empty array instead of throwing error
    return []
  }
}

export async function saveJsonData(data: any) {
  await ensureDirectoryExists()
  try {
    // Validate data is an array
    if (!Array.isArray(data)) {
      throw new Error("Ungültiges Datenformat")
    }

    // Create a backup of the current data if it exists
    try {
      const currentData = await fs.readFile(DATA_FILE, "utf-8")
      if (currentData) {
        await fs.writeFile(BACKUP_FILE, currentData, "utf-8")
      }
    } catch (error) {
      console.error("Error creating backup:", error)
      // Continue even if backup fails
    }

    // Save the new data
    const jsonString = JSON.stringify(data, null, 2)
    await fs.writeFile(DATA_FILE, jsonString, "utf-8")

    return { success: true }
  } catch (error) {
    console.error("Error saving JSON data:", error)
    throw new Error("Fehler beim Speichern der Daten: " + (error as Error).message)
  }
}

export async function restoreBackup() {
  await ensureDirectoryExists()
  try {
    const backupData = await fs.readFile(BACKUP_FILE, "utf-8")
    await fs.writeFile(DATA_FILE, backupData, "utf-8")
    return JSON.parse(backupData)
  } catch (error) {
    console.error("Error restoring backup:", error)
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error("Kein Backup gefunden")
    }
    throw new Error("Fehler beim Wiederherstellen des Backups")
  }
}

