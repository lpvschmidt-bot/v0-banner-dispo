# Technische Anleitung: API-Zugriff für Newsletter-System

## Was ist passiert?

Vercel Deployment Protection wurde für die Production-Domain aktiviert und blockiert externe API-Zugriffe ohne zusätzlichen Token.

## Erforderliche Änderung

Deine API-Calls benötigen jetzt einen zusätzlichen Query-Parameter.

### Alter Aufruf (funktioniert nicht mehr)
```
https://[domain]/api/banner-data?year=2025&week=50&code=banner2024
```

### Neuer Aufruf (mit Bypass-Token)
```
https://[domain]/api/banner-data?year=2025&week=50&code=banner2024&x-vercel-protection-bypass=vbEIo2xRWyzzFFTCt6TG6qK1oWldmRV1
```

## Der zusätzliche Parameter

```
&x-vercel-protection-bypass=vbEIo2xRWyzzFFTCt6TG6qK1oWldmRV1
```

**Bypass-Token:**
```
vbEIo2xRWyzzFFTCt6TG6qK1oWldmRV1
```

## Test

### cURL-Beispiel
```bash
curl "https://[domain]/api/banner-data?year=2025&week=50&code=banner2024&x-vercel-protection-bypass=vbEIo2xRWyzzFFTCt6TG6qK1oWldmRV1"
```

### Erwartete Response
JSON-Array mit Banner-Objekten (Status 200), z.B.:
```json
[
  {
    "id": "1234567890",
    "position": "1",
    "format": "Topbanner",
    "creative": "https://...",
    "zielUrlFinal": "https://...",
    ...
  }
]
```

### Fehler ohne Token
- Status: 401 oder 403
- Bedeutung: Deployment Protection blockiert den Zugriff

## Was du tun musst

1. **Bypass-Token zu deinen API-Calls hinzufügen**
   - Hänge `&x-vercel-protection-bypass=vbEIo2xRWyzzFFTCt6TG6qK1oWldmRV1` an alle Banner-API-Aufrufe an
   
2. **Testen**
   - Führe einen Test-Call mit dem Token durch
   - Verifiziere, dass du JSON-Daten statt 401/403 erhältst

3. **Deployment**
   - Keine weiteren Änderungen nötig
   - JSON-Format bleibt unverändert

## API-Endpunkte

### Banner-Daten abrufen
```
GET /api/banner-data?year=YYYY&week=WW&code=banner2024&x-vercel-protection-bypass=vbEIo2xRWyzzFFTCt6TG6qK1oWldmRV1
```

### Verfügbare Wochen abrufen
```
GET /api/available-weeks?year=YYYY&code=banner2024&x-vercel-protection-bypass=vbEIo2xRWyzzFFTCt6TG6qK1oWldmRV1
```

## Wichtig

- **Der Bypass-Token muss dauerhaft in deinem System hinterlegt werden**
- Ohne Token = 403 Fehler
- Token ist projektspezifisch und ändert sich nicht automatisch
- Beide Parameter (`code` + `x-vercel-protection-bypass`) sind jetzt erforderlich

## Fragen?

Bei Problemen oder für einen gemeinsamen Test-Call melde dich.

---

*Letzte Aktualisierung: 14. Dezember 2025*
