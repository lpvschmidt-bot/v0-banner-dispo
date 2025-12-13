import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Das Codewort, das in der URL erwartet wird
// In einer Produktionsumgebung sollten Sie diesen Wert in einer Umgebungsvariable speichern
const SECRET_CODE = "banner2024"

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // API-Routen und statische Dateien immer erlauben
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname.includes(".svg")) {
    return NextResponse.next()
  }

  // Überprüfen, ob das Codewort in der URL vorhanden ist
  const params = new URLSearchParams(search)
  const code = params.get("code")

  if (code !== SECRET_CODE) {
    // Wenn kein gültiges Codewort, zeige eine einfache Fehlermeldung
    return new NextResponse("Zugriff verweigert. Bitte fügen Sie das korrekte Codewort zur URL hinzu.", { status: 403 })
  }

  // Wenn das Codewort korrekt ist, erlaube den Zugriff
  return NextResponse.next()
}

// Konfiguriere die Middleware, um auf allen Pfaden zu laufen
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)", "/api/:path*"],
}

