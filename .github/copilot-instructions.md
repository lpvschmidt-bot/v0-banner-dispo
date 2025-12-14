# Copilot Instructions: Banner-Designer

## Projektübersicht

Next.js 15-Anwendung zur Verwaltung von Werbebannern für Newsletter-Kampagnen. Benutzer erstellen wochenbasierte Banner-Konfigurationen mit automatischer Tracking-URL-Generierung und Live-Vorschau.

## Architektur & Datenfluss

### Storage-Abstraktionsschicht
Dual-Mode-Speicher mit automatischem Fallback:
- **Production**: Vercel Blob Storage (`@vercel/blob`) wenn `BLOB_READ_WRITE_TOKEN` gesetzt
- **Development**: Lokales Dateisystem in `/data` Verzeichnis
- **Wichtig**: Alle Speicheroperationen in [app/lib/blob-storage.ts](app/lib/blob-storage.ts) implementiert
- JSON-Dateien: `banner-data-YYYY-KWXX.json` (Jahr + Kalenderwoche)
- Backups: Automatisch erstellt als `.backup` Suffix bei jeder Speicherung

### URL-Generierung (Kernlogik)
Tracking-URLs werden in [app/components/BannerForm.tsx](app/components/BannerForm.tsx) generiert:
```typescript
const generateFinalUrl = (clickUrl: string, kundeBanner: string) => {
  const encodedClickUrl = encodeURIComponent(clickUrl)
  return `https://lebensmittelpraxis.de/nllink?target=${encodedClickUrl}&nl_id=${year}_KW${week}_LPcompact_${kundeBanner}&tmpl=component`
}
```
- `kundeBanner` wird automatisch sanitiert via `cleanKundeBanner()`: `/[^a-zA-Z0-9]/g`
- URLs aktualisieren sich automatisch bei Änderungen von `clickUrl` oder `kundeBanner`
- Wird auch bei Jahr/Woche-Änderung neu generiert für alle Banner

### Authentication Pattern
**Password-Protection via Middleware**: Alle Routen (UI + API) erfordern `?code=banner2024` Parameter
- Middleware: [middleware.ts](middleware.ts) - `SECRET_CODE` Konstante
- API-Validation: [app/api/banner-data/route.ts](app/api/banner-data/route.ts) - `validateCode()` Funktion
- Page.tsx: Auto-redirect bei fehlendem Code-Parameter
- **Wichtig**: Code muss in 3 Dateien synchron gehalten werden (middleware, API routes, page redirect)

### Vercel Preview Mode Support
- `NEXT_PUBLIC_VERCEL_BYPASS_TOKEN` ermöglicht Preview-Deployments
- Token wird aus URL (`x-vercel-protection-bypass` oder `vbypass`) oder Env gelesen
- Automatisches Cookie-Setting via fetch zu `/?x-vercel-protection-bypass=...&x-vercel-set-bypass-cookie=samesitenone`
- `getBypassSuffix()` fügt Token zu allen API-Calls hinzu

## API-Endpunkte

### `/api/banner-data`
Alle Operationen benötigen `?year=YYYY&week=XX&code=banner2024`:
- **GET**: Banner-Daten abrufen ([] wenn keine Daten existieren)
- **POST**: Daten speichern (Array von Banner-Objekten)
- **PUT**: Backup wiederherstellen
- **DELETE**: Aktuelle Daten und Backup löschen

### `/api/available-weeks`
- **GET**: Liste aller Wochen (1-53) mit Daten (`?year=YYYY&code=banner2024`)
- Response: `[{ week: "01", exists: true }, ...]`
- Generiert vollständige Liste aller 53 Wochen, markiert existierende
- Pattern-Matching: `banner-data-YYYY-KW(\d{2})\.json`

## Entwickler-Workflows

### Development Setup
```bash
pnpm install
pnpm dev  # Läuft auf http://localhost:3000?code=banner2024
```

### Testing Storage Modes
- **Lokal**: Keine Umgebungsvariablen → `/data` Verzeichnis
- **Blob**: `BLOB_READ_WRITE_TOKEN` setzen → Vercel Blob Storage
- Prüfung: `isBlobAvailable()` in [app/lib/blob-storage.ts](app/lib/blob-storage.ts)

### Debugging Storage
- Console Logs: `[BLOB-DEBUG]` Präfix in blob-storage.ts zeigt Blob-Zugriffe
- Lokale Dateien: `data/banner-data-YYYY-KWXX.json` und `.backup` Dateien

## Projektspezifische Konventionen

### Component-Struktur
- **Client Components**: BannerForm, BannerPreview, JsonDisplay (alle `"use client"`)
- **Server Actions**: bannerActions.ts sind Stubs (localStorage erfolgt clientseitig)
- **UI Components**: shadcn/ui in `/components/ui` (nicht direkt editieren)

### Banner-Formate
Definiert in [app/components/BannerForm.tsx](app/components/BannerForm.tsx):
1. `Topbanner` (728x90px)
2. `Rectangle` (300x250px)
3. `Half-Page-Ad` (300x600px)
4. `Bild-Text-Anzeige` (Custom Layout mit Headline/Text/CTA)

### Datenmodell
```typescript
interface BannerData {
  id: string                    // UUID
  position: string              // 1-15
  format: string                // Banner-Format
  kundeBanner: string           // Nur alphanumerisch (auto-sanitized)
  clickUrl: string              // User-Input
  zielUrlFinal: string          // Auto-generiert via generateFinalUrl()
  creative: string              // Image URL
  altText: string
  trackingPixel: string
  headline: string              // Nur Bild-Text-Anzeige
  text: string                  // Nur Bild-Text-Anzeige
  cta: string                   // Nur Bild-Text-Anzeige (default: "mehr")
  buttonTextColor: string       // Hex (default: #FFFFFF)
  buttonBackgroundColor: string // Hex (default: #098109)
}
```

### Code-Styling
- **Deutsche Kommentare/Error Messages**: Projekt ist deutsch-sprachig
- **TypeScript Strict Mode**: Alle .tsx/.ts Dateien typsicher
- **Tailwind CSS**: Styling via Utility-Klassen

## Häufige Fallstricke

1. **Blob Storage**: `addRandomSuffix: false` ist kritisch für deterministische Dateinamen
2. **Week Padding**: Kalenderwochen immer zweistellig (`week.padStart(2, '0')`)
3. **Code Parameter**: Muss bei ALLEN Fetch-Aufrufen inkludiert sein
4. **Client vs Server**: BannerForm ist Client Component - localStorage funktioniert, aber Server Actions nicht
5. **Backup-Wiederherstellung**: Überschreibt aktuelle Daten ohne zusätzliche Bestätigung
6. **Jahr-Wechsel**: Bei Jahr-Änderung wird `week` auf leer zurückgesetzt (User muss neu wählen)
7. **API Cache**: Alle API-Calls nutzen `cache: "no-store"` + Timestamp-Parameter für frische Daten

## Deployment

- **Target**: Vercel (Next.js 15 + React 19)
- **Environment Variables**: 
  - `BLOB_READ_WRITE_TOKEN` (optional, für Vercel Blob)
  - `NEXT_PUBLIC_VERCEL_BYPASS_TOKEN` (für Draft Mode)
- **Build**: `pnpm build` - Prüft TypeScript und erstellt Production Build
