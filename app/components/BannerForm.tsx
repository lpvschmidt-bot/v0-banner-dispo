"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import BannerPreview from "./BannerPreview"
import JsonDisplay from "./JsonDisplay"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Save, RotateCcw, Download, Upload, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface BannerData {
  id: string
  position: string
  format: string
  creative: string
  altText: string
  zielUrlFinal: string
  trackingPixel: string
  headline: string
  text: string
  cta: string
  clickUrl: string
  kundeBanner: string
  buttonTextColor: string
  buttonBackgroundColor: string
}

interface GlobalData {
  year: string
  week: string
}

interface WeekData {
  week: string
  exists: boolean
}

const initialBannerData: BannerData = {
  id: "",
  position: "1",
  format: "Topbanner",
  creative: "",
  altText: "",
  zielUrlFinal: "",
  trackingPixel: "",
  headline: "",
  text: "",
  cta: "mehr",
  clickUrl: "",
  kundeBanner: "",
  buttonTextColor: "#FFFFFF",
  buttonBackgroundColor: "#098109",
}

const getCurrentYearAndWeek = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  const day = Math.floor(diff / oneDay)
  const week = Math.ceil((day + start.getDay() + 1) / 7)

  return {
    year: now.getFullYear().toString(),
    week: week.toString().padStart(2, "0"),
  }
}

const cleanKundeBanner = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9]/g, "")
}

export default function BannerForm() {
  const ENV_BYPASS_TOKEN = process.env.NEXT_PUBLIC_VERCEL_BYPASS_TOKEN

  const [bannerData, setBannerData] = useState<BannerData[]>([])
  const [globalData, setGlobalData] = useState<GlobalData>(() => {
    const { year, week } = getCurrentYearAndWeek()
    return { year, week }
  })
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null)
  const [jsonKey, setJsonKey] = useState(0)
  const [availableWeeks, setAvailableWeeks] = useState<WeekData[]>([])
  const [isLoadingWeeks, setIsLoadingWeeks] = useState(false)
  const [weekError, setWeekError] = useState<string | null>(null)
  const [uniqueWeekUrl, setUniqueWeekUrl] = useState<string>("")
  const [lastModified, setLastModified] = useState<Date>(new Date())
  const [jsonPreview, setJsonPreview] = useState<string>("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [bypassToken, setBypassToken] = useState<string | null>(null)
  const [showBypassHelp, setShowBypassHelp] = useState(false)

  // Initial: Token aus URL oder Env lesen und Cookie setzen
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

  const loadBannerData = useCallback(async (year: string, week: string) => {
    try {
      const response = await fetch(
        `/api/banner-data?year=${year}&week=${week}&code=banner2024${getBypassSuffix()}&t=${Date.now()}`,
        {
        cache: "no-store",
        },
      )
      if (!response.ok) {
        if (response.status === 404) {
          setBannerData([])
          return
        }
        throw new Error("Fehler beim Laden der Daten")
      }
      const data = await response.json()
      console.log(
        "Geladene Daten:",
        data.map((banner: any) => ({ id: banner.id, kundeBanner: banner.kundeBanner })),
      )
      if (Array.isArray(data) && data.length > 0) {
        setBannerData(data)
      } else {
        setBannerData([])
      }
    } catch (error) {
      console.error("Error loading data:", error)
      setBannerData([])
    }
  }, [])

  useEffect(() => {
    const loadAvailableWeeks = async () => {
      setIsLoadingWeeks(true)
      setWeekError(null)
      try {
        const response = await fetch(
          `/api/available-weeks?year=${globalData.year}&code=banner2024${getBypassSuffix()}`,
          { cache: "no-store" },
        )
        if (!response.ok) {
          throw new Error("Fehler beim Laden der verfügbaren Wochen")
        }
        const weeks: WeekData[] = await response.json()
        setAvailableWeeks(weeks)
        if (weeks.length > 0 && !weeks.some((w) => w.week === globalData.week)) {
          setGlobalData((prev) => ({ ...prev, week: weeks[0].week }))
        }
      } catch (error: any) {
        console.error("Error loading available weeks:", error)
        setWeekError("Fehler beim Laden der verfügbaren Wochen")
        setShowBypassHelp(true)
      } finally {
        setIsLoadingWeeks(false)
      }
    }
    loadAvailableWeeks()
  }, [globalData.year, globalData.week])

  useEffect(() => {
    if (!globalData.year || !globalData.week) {
      updateUniqueWeekUrl(globalData.year, globalData.week)
      return
    }
    loadBannerData(globalData.year, globalData.week)
    updateUniqueWeekUrl(globalData.year, globalData.week)
  }, [globalData.year, globalData.week, loadBannerData])

  const updateUniqueWeekUrl = (year: string, week: string) => {
    const baseUrl = window.location.origin
    if (!year || !week) {
      setUniqueWeekUrl("")
      return
    }
    const uniqueUrl = `${baseUrl}/api/banner-data?year=${year}&week=${week}&code=banner2024${getBypassSuffix()}`
    setUniqueWeekUrl(uniqueUrl)
  }

  const addNewBanner = () => {
    const newBanner = {
      ...initialBannerData,
      id: Date.now().toString(),
      position: (bannerData.length + 1).toString(),
      zielUrlFinal: generateFinalUrl("", ""),
    }
    setBannerData((prevData) => [...prevData, newBanner])
    setOpenAccordionId(newBanner.id)
    setLastModified(new Date())
  }

  const handleChange = (id: string, field: keyof BannerData, value: string) => {
    setBannerData((prevData) =>
      prevData.map((banner) => {
        if (banner.id === id) {
          const updatedValue = field === "kundeBanner" ? cleanKundeBanner(value) : value
          const updatedBanner = { ...banner, [field]: updatedValue }
          if (field === "clickUrl" || field === "kundeBanner") {
            updatedBanner.zielUrlFinal = generateFinalUrl(updatedBanner.clickUrl, updatedBanner.kundeBanner)
          }
          return updatedBanner
        }
        return banner
      }),
    )
    setLastModified(new Date())
  }

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
      loadBannerData(newYear, newWeek)
    } else {
      setBannerData(
        bannerData.map((banner) => ({
          ...banner,
          zielUrlFinal: generateFinalUrl(banner.clickUrl, banner.kundeBanner),
        })),
      )
    }
    updateUniqueWeekUrl(newYear, newWeek)
    setLastModified(new Date())
  }

  const removeBanner = (id: string) => {
    setBannerData(bannerData.filter((banner) => banner.id !== id))
    if (openAccordionId === id) {
      setOpenAccordionId(null)
    }
    setLastModified(new Date())
  }

  const reloadJsonDisplay = useCallback(() => {
    setJsonKey((prevKey) => prevKey + 1)
  }, [])

  const handleSave = async (data: BannerData[]) => {
    try {
      // Sortiere Banner nach Position vor dem Speichern
      const sortedData = [...data].sort((a, b) => {
        const posA = parseInt(a.position) || 0
        const posB = parseInt(b.position) || 0
        return posA - posB
      })
      const jsonString = JSON.stringify(sortedData, null, 2)
      setJsonPreview(jsonString)
      setIsPreviewOpen(true)
    } catch (error) {
      console.error("Error preparing JSON data:", error)
      alert(`Fehler beim Vorbereiten der Daten: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`)
    }
  }

  const confirmSave = async () => {
    try {
      const response = await fetch(
        `/api/banner-data?year=${globalData.year}&week=${globalData.week}&code=banner2024${getBypassSuffix()}`,
        {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonPreview,
        cache: "no-store",
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Fehler beim Speichern der Daten")
      }

      const result = await response.json()
      if (result.success) {
        console.log("Daten wurden erfolgreich gespeichert.")
        console.log("Gespeicherte Datei:", result.savedUrl)
        console.log(
          "Nach dem Speichern - kundeBanner Werte:",
            result.data.map((banner: any) => ({ id: banner.id, kundeBanner: banner.kundeBanner })),
        )

        if (Array.isArray(result.data)) {
          setBannerData(result.data)
        }
        reloadJsonDisplay()
        alert(`Daten wurden erfolgreich gespeichert.
Gespeicherte Datei: ${result.savedUrl}`)
      } else {
        throw new Error("Unerwarteter Fehler beim Speichern der Daten")
      }
    } catch (error) {
      console.error("Fehler beim Speichern der Daten:", error)
      alert(error instanceof Error ? error.message : "Fehler beim Speichern der Daten. Bitte versuchen Sie es erneut.")
    } finally {
      setIsPreviewOpen(false)
    }
  }

  const handleRestore = async () => {
    try {
      const response = await fetch(
        `/api/banner-data?year=${globalData.year}&week=${globalData.week}&code=banner2024${getBypassSuffix()}`,
        {
        method: "PUT",
        cache: "no-store",
        },
      )
      if (!response.ok) {
        throw new Error("Fehler beim Wiederherstellen des Backups")
      }
      const restoredData = await response.json()
      setBannerData(restoredData)
      if (restoredData.length > 0) {
        setOpenAccordionId(restoredData[0].id)
      }
      alert("Vorherige Version wurde wiederhergestellt.")
      reloadJsonDisplay()
      setLastModified(new Date())
    } catch (error) {
      console.error("Fehler beim Wiederherstellen der vorherigen Version:", error)
      alert("Fehler beim Wiederherstellen der vorherigen Version. Bitte versuchen Sie es erneut.")
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Sind Sie sicher, dass Sie die Daten für diese Woche löschen möchten?")) {
      try {
        const response = await fetch(
          `/api/banner-data?year=${globalData.year}&week=${globalData.week}&code=banner2024${getBypassSuffix()}`,
          {
            method: "DELETE",
            cache: "no-store",
          },
        )
        if (!response.ok) {
          throw new Error("Fehler beim Löschen der Daten")
        }
        const result = await response.json()
        if (result.success) {
          setBannerData([])
          console.log("Gelöschte Dateien:", result.deletedFiles)
          alert(`Daten wurden erfolgreich gelöscht.
Gelöschte Dateien: ${result.deletedFiles.join(", ")}`)
          reloadJsonDisplay()
          setLastModified(new Date())
          // Lade die Daten neu, um sicherzustellen, dass sie wirklich gelöscht wurden
          await loadBannerData(globalData.year, globalData.week)
        } else {
          throw new Error(result.error || "Unerwarteter Fehler beim Löschen der Daten")
        }
      } catch (error) {
        console.error("Fehler beim Löschen der Daten:", error)
        alert("Fehler beim Löschen der Daten. Bitte versuchen Sie es erneut.")
      }
    }
  }

  const generateFinalUrl = (clickUrl: string, kundeBanner: string) => {
    const encodedClickUrl = encodeURIComponent(clickUrl)
    return `https://lebensmittelpraxis.de/nllink?target=${encodedClickUrl}&nl_id=${globalData.year}_KW${globalData.week}_LPcompact_${kundeBanner}&tmpl=component`
  }

  const downloadJsonData = async () => {
    try {
      const response = await fetch(
        `/api/banner-data?year=${globalData.year}&week=${globalData.week}&code=banner2024${getBypassSuffix()}`,
      )
      if (!response.ok) {
        throw new Error("Fehler beim Abrufen der Daten")
      }
      const data = await response.json()
      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `banner-data-${globalData.year}-KW${globalData.week}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Fehler beim Herunterladen der JSON-Daten:", error)
      alert("Fehler beim Herunterladen der JSON-Daten. Bitte versuchen Sie es erneut.")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const jsonData = JSON.parse(content)

        if (Array.isArray(jsonData)) {
          setBannerData(jsonData)
          alert("JSON-Daten wurden erfolgreich importiert.")
          reloadJsonDisplay()
          setLastModified(new Date())
        } else {
          throw new Error("Ungültiges JSON-Format")
        }
      } catch (error) {
        console.error("Fehler beim Parsen der JSON-Datei:", error)
        alert(
          "Fehler beim Einlesen der JSON-Datei. Bitte stellen Sie sicher, dass es sich um eine gültige JSON-Datei handelt.",
        )
      }
    }
    reader.readAsText(file)
  }

  const handleSubmit = () => {
    handleSave(bannerData)
  }

  // Banner nach Position sortieren
  const sortedBannerData = [...bannerData].sort((a, b) => {
    const posA = parseInt(a.position) || 0
    const posB = parseInt(b.position) || 0
    return posA - posB
  })

  return (
    <div className="space-y-8">
      {/* Globale Einstellungen */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            {showBypassHelp && (
              <div className="mb-4 rounded border border-yellow-300 bg-yellow-50 p-3 text-sm">
                <p className="mb-2">
                  Zugriff geschützt. Bitte setzen Sie den Bypass-Token (SSO-Schutz). Wenn Sie den Token
                  nicht als Umgebungsvariable gesetzt haben, fügen Sie ihn unten ein.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Bypass-Token einfügen"
                    value={bypassToken ?? ""}
                    onChange={(e) => setBypassToken(e.target.value.trim() || null)}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (bypassToken) {
                        const url = `/?x-vercel-protection-bypass=${bypassToken}&x-vercel-set-bypass-cookie=samesitenone`
                        fetch(url)
                          .then(() => {
                            setShowBypassHelp(false)
                            // Wochenliste neu laden
                            setIsLoadingWeeks(true)
                            setWeekError(null)
                            fetch(`/api/available-weeks?year=${globalData.year}&code=banner2024${getBypassSuffix()}`, {
                              cache: "no-store",
                            })
                              .then(async (r) => {
                                if (!r.ok) throw new Error("Fehler beim Laden der verfügbaren Wochen")
                                const weeks: WeekData[] = await r.json()
                                setAvailableWeeks(weeks)
                              })
                              .catch((err) => {
                                console.error(err)
                                setWeekError("Fehler beim Laden der verfügbaren Wochen")
                              })
                              .finally(() => setIsLoadingWeeks(false))
                          })
                          .catch(() => {})
                      }
                    }}
                  >
                    Zugang entsperren
                  </Button>
                </div>
              </div>
            )}
            <Label htmlFor="year">Jahr</Label>
            <Select onValueChange={(value) => handleGlobalChange("year", value)} value={globalData.year}>
              <SelectTrigger id="year">
                <SelectValue placeholder="Wählen Sie ein Jahr" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(5)].map((_, i) => {
                  const year = (new Date().getFullYear() + i - 2).toString()
                  return (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="week">Kalenderwoche</Label>
            <Select
              onValueChange={(value) => handleGlobalChange("week", value)}
              value={globalData.week}
              disabled={isLoadingWeeks}
            >
              <SelectTrigger id="week">
                <SelectValue placeholder={isLoadingWeeks ? "Laden..." : "Wählen Sie eine Kalenderwoche"} />
              </SelectTrigger>
              <SelectContent>
                {availableWeeks.map((weekData) => (
                  <SelectItem key={weekData.week} value={weekData.week}>
                    KW {weekData.week} {!weekData.exists && "(Neu)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {weekError && <p className="text-red-500 text-sm">{weekError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentFile">Aktuelle Datei</Label>
            <Input id="currentFile" value={`banner-data-${globalData.year}-KW${globalData.week}.json`} readOnly />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="uniqueUrl">Eindeutige URL für diese Woche</Label>
          <Input id="uniqueUrl" value={uniqueWeekUrl} readOnly />
        </div>
      </div>

      {/* Zwei-Spalten-Layout: Links Formular, Rechts Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Linke Spalte: Akkordeon mit Formularen */}
        <div className="space-y-4">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            value={openAccordionId || undefined}
            onValueChange={(value) => setOpenAccordionId(value)}
          >
            {sortedBannerData.map((banner, index) => (
              <AccordionItem value={banner.id} key={banner.id}>
                <AccordionTrigger className="text-lg font-semibold" aria-label={`Banner ${index + 1}: ${banner.format}${banner.kundeBanner ? ` - ${banner.kundeBanner}` : ''}`}>
                  Position {banner.position}: {banner.format}{banner.kundeBanner ? ` - ${banner.kundeBanner}` : ''}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`position-${banner.id}`}>Position</Label>
                        <Select
                          onValueChange={(value) => handleChange(banner.id, "position", value)}
                          value={banner.position}
                        >
                          <SelectTrigger id={`position-${banner.id}`}>
                            <SelectValue placeholder="Wählen Sie eine Position" />
                          </SelectTrigger>
                          <SelectContent>
                            {[...Array(15)].map((_, i) => (
                              <SelectItem key={i} value={(i + 1).toString()}>
                                {i + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`format-${banner.id}`}>Format</Label>
                        <Select onValueChange={(value) => handleChange(banner.id, "format", value)} value={banner.format}>
                          <SelectTrigger id={`format-${banner.id}`}>
                            <SelectValue placeholder="Wählen Sie ein Format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Topbanner">Topbanner</SelectItem>
                            <SelectItem value="Rectangle">Rectangle</SelectItem>
                            <SelectItem value="Half-Page-Ad">Half-Page-Ad</SelectItem>
                            <SelectItem value="Bild-Text-Anzeige">Bild-Text-Anzeige</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`kundeBanner-${banner.id}`}>Kunde_Banner</Label>
                      <Input
                        id={`kundeBanner-${banner.id}`}
                        name={`kundeBanner-${banner.id}`}
                        value={banner.kundeBanner}
                        onChange={(e) => handleChange(banner.id, "kundeBanner", cleanKundeBanner(e.target.value))}
                        aria-label="Kunde Banner"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`creative-${banner.id}`}>Creative URL</Label>
                      <Input
                        id={`creative-${banner.id}`}
                        name={`creative-${banner.id}`}
                        value={banner.creative}
                        onChange={(e) => handleChange(banner.id, "creative", e.target.value)}
                        aria-label="Creative URL"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`altText-${banner.id}`}>Alt-Text</Label>
                      <Input
                        id={`altText-${banner.id}`}
                        name={`altText-${banner.id}`}
                        value={banner.altText}
                        onChange={(e) => handleChange(banner.id, "altText", e.target.value)}
                        aria-label="Alt-Text"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`clickUrl-${banner.id}`}>Click-URL</Label>
                      <Input
                        id={`clickUrl-${banner.id}`}
                        name={`clickUrl-${banner.id}`}
                        value={banner.clickUrl}
                        onChange={(e) => handleChange(banner.id, "clickUrl", e.target.value)}
                        aria-label="Click-URL"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`zielUrlFinal-${banner.id}`}>Ziel-URL final</Label>
                      <Input
                        id={`zielUrlFinal-${banner.id}`}
                        name={`zielUrlFinal-${banner.id}`}
                        value={banner.zielUrlFinal}
                        readOnly
                        aria-label="Ziel-URL final"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`trackingPixel-${banner.id}`}>Tracking-Pixel</Label>
                      <Input
                        id={`trackingPixel-${banner.id}`}
                        name={`trackingPixel-${banner.id}`}
                        value={banner.trackingPixel}
                        onChange={(e) => handleChange(banner.id, "trackingPixel", e.target.value)}
                        aria-label="Tracking-Pixel"
                      />
                    </div>
                    {banner.format === "Bild-Text-Anzeige" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor={`headline-${banner.id}`}>Headline</Label>
                          <Input
                            id={`headline-${banner.id}`}
                            name={`headline-${banner.id}`}
                            value={banner.headline}
                            onChange={(e) => handleChange(banner.id, "headline", e.target.value)}
                            aria-label="Headline"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`text-${banner.id}`}>Text</Label>
                          <Textarea
                            id={`text-${banner.id}`}
                            name={`text-${banner.id}`}
                            value={banner.text}
                            onChange={(e) => handleChange(banner.id, "text", e.target.value)}
                            rows={3}
                            aria-label="Text"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`cta-${banner.id}`}>CTA</Label>
                          <Input
                            id={`cta-${banner.id}`}
                            name={`cta-${banner.id}`}
                            value={banner.cta}
                            onChange={(e) => handleChange(banner.id, "cta", e.target.value)}
                            aria-label="CTA"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`buttonTextColor-${banner.id}`}>Button Textfarbe (HEX)</Label>
                          <Input
                            id={`buttonTextColor-${banner.id}`}
                            name={`buttonTextColor-${banner.id}`}
                            type="color"
                            value={banner.buttonTextColor}
                            onChange={(e) => handleChange(banner.id, "buttonTextColor", e.target.value)}
                            aria-label="Button Textfarbe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`buttonBackgroundColor-${banner.id}`}>Button Hintergrundfarbe (HEX)</Label>
                          <Input
                            id={`buttonBackgroundColor-${banner.id}`}
                            name={`buttonBackgroundColor-${banner.id}`}
                            type="color"
                            value={banner.buttonBackgroundColor}
                            onChange={(e) => handleChange(banner.id, "buttonBackgroundColor", e.target.value)}
                            aria-label="Button Hintergrundfarbe"
                          />
                        </div>
                      </>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => removeBanner(banner.id)}
                      aria-label={`Banner ${banner.id} entfernen`}
                    >
                      Banner entfernen
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Rechte Spalte: Fixe Preview */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <h3 className="text-xl font-semibold">Live-Vorschau</h3>
          {bannerData.length === 0 ? (
            <div className="border p-8 rounded-lg text-center text-gray-500">
              Keine Banner vorhanden. Fügen Sie einen Banner hinzu.
            </div>
          ) : (
            <div className="space-y-4">
              {sortedBannerData.map((banner) => (
                <div key={banner.id}>
                  <div className="text-sm font-medium text-gray-600 mb-2">Position {banner.position}</div>
                  <BannerPreview banner={banner} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Aktionsbuttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={addNewBanner}
          className="bg-green-800 hover:bg-green-700 text-white"
          aria-label="Weiterer Banner hinzufügen"
        >
          <Plus className="w-4 h-4 mr-2" />
          Weiterer Banner
        </Button>
        <Button onClick={handleSubmit} aria-label="Daten speichern">
          <Save className="w-4 h-4 mr-2" />
          Speichern
        </Button>
        <Button variant="secondary" onClick={handleRestore} aria-label="Letzte Speicherung wiederherstellen">
          <RotateCcw className="w-4 h-4 mr-2" />
          Letzte Speicherung
        </Button>
        <Button variant="outline" onClick={downloadJsonData} aria-label="JSON-Daten herunterladen">
          <Download className="w-4 h-4 mr-2" />
          JSON herunterladen
        </Button>
        <Button variant="destructive" onClick={handleDelete} aria-label="Daten löschen">
          <Trash2 className="w-4 h-4 mr-2" />
          Löschen
        </Button>
        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="JSON-Datei importieren"
          />
          <Button variant="outline" aria-label="JSON-Datei importieren">
            <Upload className="w-4 h-4 mr-2" />
            JSON importieren
          </Button>
        </div>
      </div>
      <JsonDisplay data={bannerData} key={jsonKey} />
      <div className="mt-8 text-sm text-gray-500">
        <p>Letzte Änderung: {lastModified.toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}</p>
      </div>
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>JSON-Vorschau</DialogTitle>
            <DialogDescription>Überprüfen Sie die Daten und bestätigen Sie das Speichern.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-96 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{jsonPreview}</pre>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={confirmSave}>Speichern bestätigen</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

