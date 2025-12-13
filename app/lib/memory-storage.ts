// Simple in-memory storage
let data: any[] = []
let backup: any[] | null = null

export async function getJsonData(): Promise<any[]> {
  return data
}

export async function saveJsonData(newData: any[]): Promise<void> {
  backup = [...data]
  data = newData
}

export async function restoreBackup(): Promise<any[]> {
  if (!backup) {
    throw new Error("Kein Backup gefunden")
  }
  data = [...backup]
  return data
}

