import fs from "fs/promises"
import path from "path"

const DATA_FILE = path.join(process.cwd(), "data", "banner-data.json")
const BACKUP_FILE = path.join(process.cwd(), "data", "banner-data-backup.json")

export async function getJsonData(): Promise<any[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
      await fs.writeFile(DATA_FILE, "[]", "utf-8")
      return []
    }
    throw error
  }
}

export async function saveJsonData(data: any[]): Promise<void> {
  try {
    // Create a backup of the current data
    const currentData = await getJsonData()
    await fs.writeFile(BACKUP_FILE, JSON.stringify(currentData, null, 2), "utf-8")

    // Save the new data
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8")
  } catch (error) {
    console.error("Error saving JSON data:", error)
    throw new Error("Fehler beim Speichern der Daten")
  }
}

export async function restoreBackup(): Promise<any[]> {
  try {
    const backupData = await fs.readFile(BACKUP_FILE, "utf-8")
    await fs.writeFile(DATA_FILE, backupData, "utf-8")
    return JSON.parse(backupData)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error("Kein Backup gefunden")
    }
    throw error
  }
}

