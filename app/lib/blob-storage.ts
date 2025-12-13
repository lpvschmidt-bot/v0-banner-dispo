import { put, list, del, type ListBlobResultBlob } from "@vercel/blob"
import fs from "fs/promises"
import path from "path"

// Local file storage paths
const DATA_DIR = path.join(process.cwd(), "data")
const getLocalFileName = (year: string, week: string) => path.join(DATA_DIR, `banner-data-${year}-KW${week}.json`)
const getLocalBackupFileName = (year: string, week: string) =>
  path.join(DATA_DIR, `banner-data-${year}-KW${week}.json.backup`)

// Check if Vercel Blob is available
const isBlobAvailable = () => {
  return process.env.BLOB_READ_WRITE_TOKEN !== undefined
}

// Ensure local directory exists
async function ensureLocalDirectoryExists() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

const getFileName = (year: string, week: string) => `banner-data-${year}-KW${week}.json`

export async function getJsonData(year: string, week: string): Promise<any[] | null> {
  try {
    if (isBlobAvailable()) {
      // Use Vercel Blob storage
      const fileName = getFileName(year, week)
      // List all blobs and filter by prefix to support legacy blobs with random suffixes
      const { blobs } = await list()
      const matchingBlobs = blobs.filter((blob) => blob.pathname.startsWith(fileName))
      const jsonBlob = matchingBlobs[0] ?? null

      if (!jsonBlob) {
        return null
      }

      const response = await fetch(jsonBlob.url, { cache: "no-store" })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return Array.isArray(data) ? data : null
    } else {
      // Fallback to local file storage
      await ensureLocalDirectoryExists()
      const localFilePath = getLocalFileName(year, week)

      try {
        const data = await fs.readFile(localFilePath, "utf-8")
        return JSON.parse(data)
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return null
        }
        throw error
      }
    }
  } catch (error) {
    console.error("Error reading data:", error)
    throw error
  }
}

export async function saveJsonData(year: string, week: string, data: any[]): Promise<string> {
  try {
    const jsonString = JSON.stringify(data, null, 2)

    if (isBlobAvailable()) {
      // Use Vercel Blob storage; disable random suffix so read finds exact filename
      const fileName = getFileName(year, week)
      const jsonBlob = new Blob([jsonString], {
        type: "application/json",
      })
      const { url } = await put(fileName, jsonBlob, { access: "public", addRandomSuffix: false })

      // Create backup (no random suffix)
      const backupFileName = `${fileName}.backup`
      await put(backupFileName, jsonBlob, { access: "public", addRandomSuffix: false })

      return url
    } else {
      // Fallback to local file storage
      await ensureLocalDirectoryExists()
      const localFilePath = getLocalFileName(year, week)
      const localBackupPath = getLocalBackupFileName(year, week)

      // Create backup if file exists
      try {
        const currentData = await fs.readFile(localFilePath, "utf-8")
        await fs.writeFile(localBackupPath, currentData, "utf-8")
      } catch (error) {
        // Ignore if file doesn't exist yet
      }

      // Save new data
      await fs.writeFile(localFilePath, jsonString, "utf-8")
      return `file://${localFilePath}`
    }
  } catch (error) {
    console.error("Error saving data:", error)
    throw error
  }
}

export async function restoreBackup(year: string, week: string): Promise<any[]> {
  try {
    if (isBlobAvailable()) {
      // Use Vercel Blob storage
      const { blobs } = await list()
      const backupFileName = `${getFileName(year, week)}.backup`
      const backupBlob = blobs.find((blob) => blob.pathname === backupFileName)

      if (!backupBlob) {
        throw new Error("Kein Backup gefunden")
      }

      const response = await fetch(backupBlob.url)
      const backupData = await response.json()

      // Restore backup data as current data
      await saveJsonData(year, week, backupData)

      return backupData
    } else {
      // Fallback to local file storage
      await ensureLocalDirectoryExists()
      const localFilePath = getLocalFileName(year, week)
      const localBackupPath = getLocalBackupFileName(year, week)

      try {
        const backupData = await fs.readFile(localBackupPath, "utf-8")
        await fs.writeFile(localFilePath, backupData, "utf-8")
        return JSON.parse(backupData)
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          throw new Error("Kein Backup gefunden")
        }
        throw error
      }
    }
  } catch (error) {
    console.error("Error restoring backup:", error)
    throw error
  }
}

export async function deleteJsonData(year: string, week: string): Promise<string[]> {
  try {
    if (isBlobAvailable()) {
      // Use Vercel Blob storage
      const fileName = getFileName(year, week)
      const backupFileName = `${fileName}.backup`
      const { blobs } = await list()

      const filesToDelete = blobs.filter((blob) => blob.pathname === fileName || blob.pathname === backupFileName)

      const deletedFiles = await Promise.all(
        filesToDelete.map(async (blob) => {
          await del(blob.url)
          return blob.pathname
        }),
      )

      return deletedFiles
    } else {
      // Fallback to local file storage
      await ensureLocalDirectoryExists()
      const localFilePath = getLocalFileName(year, week)
      const localBackupPath = getLocalBackupFileName(year, week)

      const deletedFiles: string[] = []

      try {
        await fs.access(localFilePath)
        await fs.unlink(localFilePath)
        deletedFiles.push(localFilePath)
      } catch (error) {
        // Ignore if file doesn't exist
      }

      try {
        await fs.access(localBackupPath)
        await fs.unlink(localBackupPath)
        deletedFiles.push(localBackupPath)
      } catch (error) {
        // Ignore if file doesn't exist
      }

      return deletedFiles
    }
  } catch (error) {
    console.error("Error deleting data:", error)
    throw error
  }
}

