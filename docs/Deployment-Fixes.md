# Deployment-Fixes: Funktionierendes Banner-Designer Deployment

## Übersicht
Dieses Dokument beschreibt alle Änderungen, die notwendig waren, um das Banner-Designer Deployment auf Vercel funktionsfähig zu machen und die JSON-Daten über APIs erreichbar zu gestalten.

## Ausgangssituation / Probleme

### 1. Vercel Deployment Protection (401/403 Fehler)
- Die Live-URL war durch Vercel Deployment Protection/SSO geschützt
- Alle Zugriffe (Root-Seite und APIs) wurden mit 401/403 blockiert
- Jahr- und Wochen-Dropdowns blieben leer, da API-Calls fehlschlugen

### 2. Leere API-Responses für vorhandene Daten
- API `/api/banner-data?year=2025&week=50` lieferte `[]`, obwohl Daten existierten
- Ursache: Vercel Blob Storage fügte bei älteren Deployments zufällige Suffixe an Dateinamen an
- Die Listing-Logik suchte nur nach exakten Dateinamen ohne Suffix-Matching

### 3. Bilder in der Vorschau nicht geladen
- Next.js `<Image>`-Komponente blockierte externe Creative-URLs
- Banner-Previews zeigten keine Bilder

### 4. Jahr/Woche-Dropdowns: State-Probleme
- Bei Jahrwechsel wurden unnötige API-Calls mit leerer Woche ausgelöst
- `handleGlobalChange` nutzte veralteten State für API-Calls

---

## Lösungen / Implementierte Fixes

### Fix 1: Vercel Deployment Protection Bypass

#### Client-seitige Bypass-Logik
**Datei:** `app/components/BannerForm.tsx`

**Änderungen:**
- Token aus URL-Parametern (`?x-vercel-protection-bypass=...` oder `?vbypass=...`) oder Umgebungsvariable `NEXT_PUBLIC_VERCEL_BYPASS_TOKEN` lesen
- Beim App-Start Cookie automatisch setzen via Fetch zu `/?x-vercel-protection-bypass=TOKEN&x-vercel-set-bypass-cookie=samesitenone`
- Token an alle API-Requests anhängen: `&x-vercel-protection-bypass=TOKEN`
- Fallback-UI: Gelbes Eingabefeld mit Button "Zugang entsperren", wenn Wochen-API fehlschlägt

**Code-Auszug:**
```typescript
const ENV_BYPASS_TOKEN = process.env.NEXT_PUBLIC_VERCEL_BYPASS_TOKEN
const [bypassToken, setBypassToken] = useState<string | null>(null)
const [showBypassHelp, setShowBypassHelp] = useState(false)

useEffect(() => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get("x-vercel-protection-bypass") || params.get("vbypass")
    const token = urlToken || ENV_BYPASS_TOKEN || null
    if (token) {
      setBypassToken(token)
      const url = `/?x-vercel-protection-bypass=${token}&x-vercel-set-bypass-cookie=samesitenone`
      fetch(url).catch(() => {})
    }
  }
}, [])

const getBypassSuffix = () => (bypassToken ? `&x-vercel-protection-bypass=${bypassToken}` : "")
```

**Vercel Environment Variable:**
- Key: `NEXT_PUBLIC_VERCEL_BYPASS_TOKEN`
- Value: `vbEIo2xRWyzzFFTCt6TG6qK1oWldmRV1`
- Scope: Production, Preview, Development

---

### Fix 2: Blob Storage Listing & Dateinamen-Matching

#### Problem
Vercel Blob fügte früher zufällige Suffixe an (z.B. `banner-data-2025-KW50-abc123.json`). Die Listing-Logik suchte nur nach exakten Namen.

#### Lösung
**Datei:** `app/lib/blob-storage.ts`

**Änderungen:**
1. `list()` statt `head()` verwenden, um alle Blobs aufzulisten
2. Prefix-Matching: `blob.pathname.startsWith(fileName)` für Legacy-Dateien mit Suffixen
3. Neue Dateien ohne Random-Suffix speichern: `addRandomSuffix: false`
4. Debug-Logs hinzugefügt

**Code-Auszug:**
```typescript
import { list } from "@vercel/blob"
import type { ListBlobResultBlob } from "@vercel/blob"

function getFileName(year: string, week: string): string {
  return `banner-data-${year}-KW${week}.json`
}

export async function getJsonData(year: string, week: string): Promise<BannerData[] | null> {
  if (STORAGE_TYPE === "blob") {
    const fileName = getFileName(year, week)
    const { blobs } = await list({ prefix: fileName })
    const matches = blobs.filter((blob: ListBlobResultBlob) => blob.pathname.startsWith(fileName))
    
    console.log(`[Blob] All blobs for prefix "${fileName}":`, blobs.map(b => b.pathname))
    console.log(`[Blob] Matching blobs:`, matches.map(b => b.pathname))
    
    if (matches.length === 0) return null
    const jsonBlob = matches[0]
    const response = await fetch(jsonBlob.url, { cache: "no-store" })
    return await response.json()
  }
  // ...
}

export async function saveJsonData(year: string, week: string, data: BannerData[]): Promise<string> {
  if (STORAGE_TYPE === "blob") {
    const fileName = getFileName(year, week)
    const jsonString = JSON.stringify(data, null, 2)
    
    const blob = await put(fileName, jsonString, {
      access: "public",
      addRandomSuffix: false,  // <-- Wichtig!
    })
    
    const backupBlob = await put(`${fileName}.backup`, jsonString, {
      access: "public",
      addRandomSuffix: false,
    })
    
    return blob.url
  }
  // ...
}
```

---

### Fix 3: Image Preview mit nativen `<img>` Tags

#### Problem
Next.js `<Image>` blockierte externe Creative-URLs ohne Domain-Whitelist.

#### Lösung
**Datei:** `app/components/BannerPreview.tsx`

**Änderungen:**
- `next/image` Import entfernt
- Alle `<Image>` durch native `<img>` ersetzt
- CSS-Klassen für Sizing/Object-fit angepasst

**Code-Auszug:**
```tsx
// Vorher:
import Image from "next/image"
<Image src={banner.creative} alt={banner.altText} fill className="object-cover" />

// Nachher:
<img src={banner.creative} alt={banner.altText} className="w-full h-full object-cover" />
```

---

### Fix 4: Jahr/Woche State-Management

#### Problem
Bei Jahrwechsel wurde `loadBannerData()` mit dem alten State aufgerufen, bevor `setGlobalData` abgeschlossen war.

#### Lösung
**Datei:** `app/components/BannerForm.tsx`

**Änderungen:**
1. `handleGlobalChange` berechnet `newYear`/`newWeek` vor `setState`
2. Nutzt berechnete Werte für `loadBannerData()` und `updateUniqueWeekUrl()`
3. Guard in `useEffect`: lädt Daten nur, wenn beide Werte gesetzt sind

**Code-Auszug:**
```typescript
const handleGlobalChange = (field: keyof GlobalData, value: string) => {
  let newYear = globalData.year
  let newWeek = globalData.week
  
  if (field === "year") {
    newYear = value
    newWeek = "" // Reset week when year changes
  } else {
    newWeek = value
  }
  
  setGlobalData({ year: newYear, week: newWeek })

  if (field === "week") {
    loadBannerData(newYear, newWeek)  // <-- nutzt berechnete Werte
  }
  updateUniqueWeekUrl(newYear, newWeek)
}

useEffect(() => {
  if (!globalData.year || !globalData.week) {
    updateUniqueWeekUrl(globalData.year, globalData.week)
    return  // <-- Guard
  }
  loadBannerData(globalData.year, globalData.week)
  updateUniqueWeekUrl(globalData.year, globalData.week)
}, [globalData.year, globalData.week, loadBannerData])
```

---

## Commits & Timeline

| Commit | Beschreibung |
|--------|-------------|
| `7d7dd59` | Docs: Banner-Designer.md erstellt |
| `6e53ce5` | Blob: Initial prefix search, disable random suffix |
| `896f04b` | Blob: Debug logs hinzugefügt |
| `779479f` | Blob: list() + filter statt head() |
| `78831c3` | Preview: Next Image → native img |
| `3a69c44` | BannerForm: Client-Bypass-Token-Logik |
| `3c012d7` | BannerForm: Jahr/Woche State-Fix |
| `e0f1a9e` | Trigger Redeploy mit NEXT_PUBLIC_VERCEL_BYPASS_TOKEN |

---

## Setup für neue Entwicklungsumgebung

### Option 1: GitHub Codespaces (empfohlen)
1. Im GitHub-Repo auf **Code** → **Codespaces** → **Create codespace on main** klicken
2. Codespace startet automatisch mit vollem Repo-Zustand
3. Dependencies installieren:
   ```bash
   pnpm install
   ```
4. Dev-Server starten:
   ```bash
   pnpm dev
   ```
5. Lokal im Browser: `http://localhost:3000/?code=banner2024`

### Option 2: Lokale Entwicklung
1. Repo klonen:
   ```bash
   git clone https://github.com/lpvschmidt-bot/v0-banner-dispo.git
   cd v0-banner-dispo
   ```
2. Dependencies:
   ```bash
   pnpm install
   ```
3. Umgebungsvariablen (`.env.local` erstellen):
   ```
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
   NEXT_PUBLIC_VERCEL_BYPASS_TOKEN=vbEIo2xRWyzzFFTCt6TG6qK1oWldmRV1
   ```
4. Dev-Server:
   ```bash
   pnpm dev
   ```

---

## Vercel Production Setup

### Erforderliche Environment Variables
In Vercel Project Settings → Environment Variables:

| Key | Value | Scope |
|-----|-------|-------|
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_rw_...` | Production, Preview, Development |
| `NEXT_PUBLIC_VERCEL_BYPASS_TOKEN` | `vbEIo2xRWyzzFFTCt6TG6qK1oWldmRV1` | Production, Preview, Development |

### Deployment Protection
- **Status:** Aktiviert (SSO/Token-basiert)
- **Bypass:** Automatisch via `NEXT_PUBLIC_VERCEL_BYPASS_TOKEN`
- **Fallback:** Gelbes UI-Feld für manuelle Token-Eingabe

---

## API-Endpoints

### Available Weeks
```
GET /api/available-weeks?year=2025&code=banner2024
```
**Response:**
```json
[
  {"week":"01","exists":false},
  {"week":"50","exists":true},
  ...
]
```

### Banner Data
```
GET /api/banner-data?year=2025&week=50&code=banner2024
```
**Response:**
```json
[
  {
    "id": "...",
    "position": "1",
    "format": "Topbanner",
    "creative": "https://...",
    ...
  }
]
```

**Hinweis:** Alle APIs benötigen `?code=banner2024` (Middleware-Check).

---

## Wichtige Dateien

- `app/components/BannerForm.tsx` – Hauptformular, Bypass-Logik, State-Management
- `app/components/BannerPreview.tsx` – Banner-Vorschau mit nativen img-Tags
- `app/lib/blob-storage.ts` – Vercel Blob Integration, Listing, Save/Restore
- `app/api/available-weeks/route.ts` – Wochen-API
- `app/api/banner-data/route.ts` – Banner-CRUD-API
- `middleware.ts` – Code-Check (`?code=banner2024`)

---

## Testing Checklist

- [ ] Custom Domain ohne URL-Token: Jahr/Woche-Dropdowns laden
- [ ] Jahrwechsel: Woche wird geleert, Liste lädt neu
- [ ] KW50 auswählen: Banner-Daten laden korrekt
- [ ] Creative-Bilder in Vorschau sichtbar
- [ ] Speichern/Wiederherstellen/Löschen funktioniert
- [ ] Eindeutige URL zeigt korrekten API-Endpoint

---

## Kontakt / Weitere Entwicklung

Bei Fragen zur Implementierung siehe Git-History und diese Dokumentation. Alle Fixes sind in `main` gemerged und auf Vercel Production deployed.

**Nächste Schritte:**
- Optional: Deployment Protection deaktivieren (falls intern genutzt)
- Optional: Next.js Image mit Domain-Whitelist konfigurieren statt native img
- Monitoring: Blob-Storage-Logs in Vercel Functions prüfen
