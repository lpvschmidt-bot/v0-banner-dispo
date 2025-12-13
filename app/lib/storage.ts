export function getJsonData(): any[] {
  const data = localStorage.getItem("banner-data")
  return data ? JSON.parse(data) : []
}

export function saveJsonData(data: any[]): void {
  localStorage.setItem("banner-data", JSON.stringify(data))
}

export function restoreBackup(): any[] {
  const backup = localStorage.getItem("banner-data-backup")
  if (!backup) {
    throw new Error("Kein Backup gefunden")
  }
  localStorage.setItem("banner-data", backup)
  return JSON.parse(backup)
}

export function createBackup(): void {
  const currentData = localStorage.getItem("banner-data")
  if (currentData) {
    localStorage.setItem("banner-data-backup", currentData)
  }
}

