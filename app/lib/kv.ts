import { kv } from "@vercel/kv"

export async function getJsonData() {
  try {
    const data = await kv.get("banner-data")
    return data || []
  } catch (error) {
    console.error("Error reading from KV:", error)
    return []
  }
}

export async function saveJsonData(data: any) {
  try {
    await kv.set("banner-data", data)
    return { success: true }
  } catch (error) {
    console.error("Error writing to KV:", error)
    throw new Error("Fehler beim Speichern der Daten")
  }
}

export async function restoreBackup() {
  try {
    const backup = await kv.get("banner-data-backup")
    if (!backup) {
      throw new Error("Kein Backup gefunden")
    }
    await kv.set("banner-data", backup)
    return backup
  } catch (error) {
    console.error("Error restoring backup:", error)
    throw new Error("Fehler beim Wiederherstellen des Backups")
  }
}

