"use client"

import { useState, useEffect } from "react"

interface JsonDisplayProps {
  data: any
}

export default function JsonDisplay({ data }: JsonDisplayProps) {
  const [jsonContent, setJsonContent] = useState<string>("")
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    setJsonContent(JSON.stringify(data, null, 2))
  }, [data])

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">JSON-Inhalt</h2>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{jsonContent}</code>
      </pre>
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">API-Zugriff:</h3>
        <p className="mb-2">
          Pfad zur JSON-Datei: <code className="bg-gray-200 p-1 rounded">/api/banner-data</code>
        </p>
        <p className="mb-2">
          Vollständige URL: <code className="bg-gray-200 p-1 rounded">{`${origin}/api/banner-data`}</code>
        </p>
        <p>Sie können auf diese Daten zugreifen, indem Sie einen GET-Request an die oben genannte URL senden.</p>
      </div>
    </div>
  )
}

