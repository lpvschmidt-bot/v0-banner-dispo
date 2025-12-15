# Technische Anleitung: API-Zugriff für Newsletter-System

## Aktueller Stand (15. Dezember 2025)

**Gute Nachricht:** Die API funktioniert aktuell **ohne** zusätzlichen Bypass-Token.

### Production-URLs (funktionieren):
```
https://zu678bannerv0da.lp-tools.de/api/banner-data?year=2025&week=50&code=banner2024
```

**Nur der `?code=banner2024` Parameter ist erforderlich.**

## Was war das Problem?

Am Freitag war die API durch Vercel Deployment Protection temporär blockiert. Das Problem ist aktuell behoben.

## Erforderliche Änderung für Newsletter-System

**Keine Änderung nötig!** Die bisherige API-URL funktioniert weiterhin:

```
GET https://zu678bannerv0da.lp-tools.de/api/banner-data?year=2025&week=50&code=banner2024
```

## Test

### cURL-Beispiel
```bash
curl "https://zu678bannerv0da.lp-tools.de/api/banner-data?year=2025&week=50&code=banner2024"
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

## Was du tun musst

**Nichts!** Die API funktioniert wie bisher.

1. **Verwende die bekannte URL:**
   ```
   https://zu678bannerv0da.lp-tools.de/api/banner-data?year=YYYY&week=WW&code=banner2024
   ```

2. **Teste einmal, dass es funktioniert:**
   - Status 200 = alles ok
   - JSON-Daten werden zurückgegeben

3. **Falls zukünftig Probleme auftreten:**
   - Melde dich sofort
   - Es könnte erneut ein Vercel-Security-Update sein

## API-Endpunkte

### Banner-Daten abrufen
```
GET https://zu678bannerv0da.lp-tools.de/api/banner-data?year=YYYY&week=WW&code=banner2024
```

### Verfügbare Wochen abrufen
```
GET https://zu678bannerv0da.lp-tools.de/api/available-weeks?year=YYYY&code=banner2024
```

## Wichtig

- **Nur `?code=banner2024` ist erforderlich**
- Kein zusätzlicher Token nötig
- JSON-Format bleibt unverändert
- Bei Problemen sofort melden (könnte erneut Vercel-Security-Update sein)

## Monitoring-Empfehlung

Um zukünftige Ausfälle zu vermeiden, könnte ein täglicher Check sinnvoll sein:
```bash
# Täglich automatisch testen:
curl -I "https://zu678bannerv0da.lp-tools.de/api/banner-data?year=2025&week=01&code=banner2024"
# Erwarteter Status: 200
# Bei 401/403 → Alarm auslösen
```

## Fragen?

Bei Problemen oder für einen gemeinsamen Test-Call melde dich.

---

*Letzte Aktualisierung: 15. Dezember 2025 - API funktioniert ohne Bypass-Token*
