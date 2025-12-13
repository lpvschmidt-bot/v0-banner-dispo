# Banner-Designer

Eine Web-Anwendung zur Verwaltung und Gestaltung von Werbebannern für Newsletter-Kampagnen.

## Überblick

Der Banner-Designer ist eine vollständige Next.js-Anwendung, die es ermöglicht, Werbebanner für verschiedene Kalenderwochen zu erstellen, zu verwalten und zu speichern. Die Anwendung generiert automatisch Tracking-URLs und bietet eine Live-Vorschau aller Banner-Formate.

## Hauptfunktionen

### 1. Banner-Verwaltung

- **Mehrere Banner pro Woche**: Erstellen Sie beliebig viele Banner für eine bestimmte Kalenderwoche
- **Verschiedene Banner-Formate**:
  - Topbanner (728x90 px)
  - Rectangle (300x250 px)
  - Half-Page-Ad (300x600 px)
  - Bild-Text-Anzeige (mit Bild, Überschrift, Text und CTA-Button)

### 2. Wochenbasierte Organisation

- **Jahr- und Wochen-Auswahl**: Wählen Sie das Jahr und die Kalenderwoche für Ihre Banner-Kampagne
- **Automatische Dateinamen**: Jede Woche erhält eine eindeutige JSON-Datei (`banner-data-YYYY-KWXX.json`)
- **Übersicht verfügbarer Wochen**: Zeigt an, welche Wochen bereits Daten enthalten

### 3. Banner-Konfiguration

Jeder Banner kann folgende Eigenschaften haben:

- **Position**: Reihenfolge des Banners (1-15)
- **Format**: Auswahl des Banner-Formats
- **Kunde_Banner**: Eindeutiger Kundenidentifikator (nur alphanumerische Zeichen)
- **Creative URL**: Link zum Banner-Bild
- **Alt-Text**: Beschreibungstext für Barrierefreiheit
- **Click-URL**: Ziel-URL, wenn auf den Banner geklickt wird
- **Tracking-Pixel**: URL für Tracking-Zwecke
- **Headline**: Überschrift (nur für Bild-Text-Anzeige)
- **Text**: Beschreibungstext (nur für Bild-Text-Anzeige)
- **CTA**: Call-to-Action Button-Text (nur für Bild-Text-Anzeige)
- **Button-Farben**: Anpassbare Text- und Hintergrundfarben für den CTA-Button

### 4. Automatische URL-Generierung

Die Anwendung generiert automatisch finale Tracking-URLs im Format:
```
https://lebensmittelpraxis.de/nllink?target=[ENCODED_CLICK_URL]&nl_id=[JAHR]_KW[WOCHE]_LPcompact_[KUNDE_BANNER]&tmpl=component
```

### 5. Live-Vorschau

- **Echtzeit-Vorschau**: Sehen Sie, wie Ihre Banner aussehen werden
- **Format-spezifische Darstellung**: Jedes Format wird in den korrekten Abmessungen angezeigt
- **Interaktive Elemente**: Testen Sie Links und Button-Styles

### 6. Datenpersistenz

#### Speicheroptionen
- **Vercel Blob Storage**: Automatische Cloud-Speicherung (wenn konfiguriert)
- **Lokaler Dateisystem-Fallback**: Speicherung im `/data` Verzeichnis (für Entwicklung)

#### Datensicherheit
- **Automatische Backups**: Bei jedem Speichern wird eine Backup-Datei erstellt
- **Versionsverwaltung**: Stellen Sie vorherige Versionen wieder her
- **Bestätigungsdialog**: JSON-Vorschau vor dem Speichern

### 7. Import/Export-Funktionen

- **JSON-Download**: Laden Sie Banner-Daten als JSON-Datei herunter
- **JSON-Upload**: Importieren Sie vorhandene Banner-Konfigurationen
- **Backup-Wiederherstellung**: Stellen Sie die vorherige Version wieder her
- **Löschen**: Entfernen Sie Banner-Daten (mit Bestätigung)

### 8. API-Zugang

Die Anwendung bietet REST-API-Endpunkte für programmatischen Zugriff:

#### Banner-Daten abrufen
```
GET /api/banner-data?year=2024&week=01&code=banner2024
```

#### Banner-Daten speichern
```
POST /api/banner-data?year=2024&week=01&code=banner2024
Content-Type: application/json

[{...banner-daten...}]
```

#### Backup wiederherstellen
```
PUT /api/banner-data?year=2024&week=01&code=banner2024
```

#### Daten löschen
```
DELETE /api/banner-data?year=2024&week=01&code=banner2024
```

#### Verfügbare Wochen abrufen
```
GET /api/available-weeks?year=2024&code=banner2024
```

### 9. Sicherheit

- **URL-basierte Authentifizierung**: Zugriff erfolgt über ein Codewort in der URL (`?code=banner2024`)
- **API-Schutz**: Alle API-Endpunkte erfordern das Codewort
- **Automatische Weiterleitung**: Benutzer ohne Codewort werden automatisch weitergeleitet

## Technische Details

### Technologie-Stack

- **Framework**: Next.js 15 (App Router)
- **Sprache**: TypeScript
- **UI-Komponenten**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS
- **Speicher**: Vercel Blob Storage / lokales Dateisystem
- **Bildoptimierung**: Next.js Image-Komponente

### Projektstruktur

```
├── app/
│   ├── api/
│   │   ├── banner-data/
│   │   │   └── route.ts          # REST API für Banner-Daten
│   │   └── available-weeks/
│   │       └── route.ts          # API für verfügbare Wochen
│   ├── components/
│   │   ├── BannerForm.tsx        # Hauptformular-Komponente
│   │   ├── BannerPreview.tsx     # Live-Vorschau-Komponente
│   │   └── JsonDisplay.tsx       # JSON-Anzeige-Komponente
│   ├── lib/
│   │   └── blob-storage.ts       # Speicher-Logik
│   └── page.tsx                  # Hauptseite
├── middleware.ts                 # Authentifizierungs-Middleware
├── data/                         # Lokaler Speicher (nicht im Repo)
└── README.md
```

### Umgebungsvariablen

```env
# Optional: Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_token_here

# Optional: Benutzerdefiniertes Codewort
ACCESS_CODE=banner2024
```

## Installation und Verwendung

### Voraussetzungen

- Node.js 18 oder höher
- npm oder yarn

### Lokale Entwicklung

1. Repository klonen:
```bash
git clone [repository-url]
cd banner-designer
```

2. Abhängigkeiten installieren:
```bash
npm install
```

3. Entwicklungsserver starten:
```bash
npm run dev
```

4. Anwendung öffnen:
```
http://localhost:3000?code=banner2024
```

### Deployment auf Vercel

1. Repository mit Vercel verbinden
2. Umgebungsvariable `BLOB_READ_WRITE_TOKEN` hinzufügen (optional)
3. Deployen

## Verwendung

### Neuen Banner erstellen

1. Wählen Sie Jahr und Kalenderwoche
2. Klicken Sie auf "Neuen Banner hinzufügen"
3. Füllen Sie die Banner-Details aus
4. Sehen Sie sich die Live-Vorschau an
5. Klicken Sie auf "Speichern", um die Daten zu persistieren

### Banner bearbeiten

1. Wählen Sie die entsprechende Woche
2. Öffnen Sie das Accordion für den gewünschten Banner
3. Ändern Sie die Felder
4. Die Vorschau aktualisiert sich automatisch
5. Speichern Sie die Änderungen

### Daten exportieren

- Klicken Sie auf "JSON herunterladen" für die aktuelle Woche
- Die Datei wird als `banner-data-YYYY-KWXX.json` heruntergeladen

### Daten importieren

- Klicken Sie auf "JSON importieren"
- Wählen Sie eine JSON-Datei aus
- Die Banner werden in die aktuelle Ansicht geladen

### Vorherige Version wiederherstellen

- Klicken Sie auf "Backup wiederherstellen"
- Die letzte gespeicherte Version wird geladen

## API für externe Programme

Andere Programme können die Banner-Daten über die REST-API abrufen:

```javascript
// Beispiel: Banner-Daten abrufen
const response = await fetch(
  'https://ihre-domain.vercel.app/api/banner-data?year=2024&week=01&code=banner2024'
);
const banners = await response.json();

// Antwort-Format:
[
  {
    "id": "1702304400000",
    "position": "1",
    "format": "Topbanner",
    "creative": "https://example.com/banner.jpg",
    "altText": "Werbebanner",
    "zielUrlFinal": "https://lebensmittelpraxis.de/nllink?target=...",
    "trackingPixel": "https://tracking.example.com/pixel.gif",
    "headline": "Jetzt kaufen!",
    "text": "Tolle Angebote diese Woche",
    "cta": "mehr",
    "clickUrl": "https://example.com/landing",
    "kundeBanner": "KundeA123",
    "buttonTextColor": "#FFFFFF",
    "buttonBackgroundColor": "#098109"
  }
]
```

## Besondere Features

### Automatische Validierung

- **Kunde_Banner**: Nur alphanumerische Zeichen werden akzeptiert
- **URL-Encoding**: Click-URLs werden automatisch für Tracking-URLs kodiert
- **Format-Validierung**: JSON-Import prüft auf gültige Struktur

### Benutzerfreundlichkeit

- **Responsive Design**: Funktioniert auf Desktop und Tablet
- **Keyboard-Navigation**: Vollständig tastaturzugänglich
- **Screen Reader**: ARIA-Labels für Barrierefreiheit
- **Visuelles Feedback**: Bestätigungsdialoge und Fehlermeldungen

### Performance

- **Lazy Loading**: Bilder werden optimiert geladen
- **Client-Side Caching**: Reduziert unnötige API-Anfragen
- **Debouncing**: Eingaben werden optimiert verarbeitet

## Wartung und Erweiterung

### Neues Banner-Format hinzufügen

1. Format in `BannerForm.tsx` zur Select-Liste hinzufügen
2. Vorschau-Layout in `BannerPreview.tsx` implementieren
3. Ggf. zusätzliche Felder im `BannerData`-Interface hinzufügen

### Codewort ändern

1. Middleware in `middleware.ts` anpassen
2. API-Routen aktualisieren
3. Frontend-Anfragen anpassen

## Support und Lizenz

Für Fragen oder Probleme wenden Sie sich bitte an den Entwickler.

---

**Letzte Aktualisierung**: Dezember 2024
**Version**: 1.0
