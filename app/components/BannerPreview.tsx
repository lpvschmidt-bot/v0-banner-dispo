import Image from "next/image"

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
  buttonTextColor: string
  buttonBackgroundColor: string
}

interface BannerPreviewProps {
  banner: BannerData
}

export default function BannerPreview({ banner }: BannerPreviewProps) {
  return (
    <div className="border p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-2">Vorschau: {banner.format}</h3>
      <a
        href={banner.zielUrlFinal}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        title={banner.altText || "Banner-Vorschau"}
        aria-label={`${banner.format} Banner: ${banner.altText || "Keine Beschreibung verfügbar"}`}
      >
        {banner.format === "Topbanner" && (
          <div className="w-full h-[90px] bg-gray-200 flex items-center justify-center overflow-hidden">
            {banner.creative && (
              <Image
                src={banner.creative || "/placeholder.svg"}
                alt={banner.altText}
                width={728}
                height={90}
                className="object-cover"
              />
            )}
          </div>
        )}
        {banner.format === "Rectangle" && (
          <div className="w-[300px] h-[250px] bg-gray-200 flex items-center justify-center overflow-hidden">
            {banner.creative && (
              <Image
                src={banner.creative || "/placeholder.svg"}
                alt={banner.altText}
                width={300}
                height={250}
                className="object-cover"
              />
            )}
          </div>
        )}
        {banner.format === "Half-Page-Ad" && (
          <div className="w-[300px] h-[600px] bg-gray-200 flex items-center justify-center overflow-hidden">
            {banner.creative && (
              <Image
                src={banner.creative || "/placeholder.svg"}
                alt={banner.altText}
                width={300}
                height={600}
                className="object-cover"
              />
            )}
          </div>
        )}
        {banner.format === "Bild-Text-Anzeige" && (
          <div className="flex flex-col space-y-4">
            <div className="w-full h-[250px] bg-gray-200 flex items-center justify-center overflow-hidden">
              {banner.creative && (
                <Image
                  src={banner.creative || "/placeholder.svg"}
                  alt={banner.altText}
                  width={300}
                  height={250}
                  className="object-cover"
                />
              )}
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-semibold">{banner.headline}</h4>
              <p className="text-sm">{banner.text}</p>
              <button
                className="px-4 py-2 rounded text-sm"
                style={{
                  color: banner.buttonTextColor || "#FFFFFF",
                  backgroundColor: banner.buttonBackgroundColor || "#098109",
                }}
                aria-label={banner.cta}
              >
                {banner.cta}
              </button>
            </div>
          </div>
        )}
      </a>
      {banner.trackingPixel && (
        <img src={banner.trackingPixel || "/placeholder.svg"} alt="Tracking Pixel" className="hidden" />
      )}
    </div>
  )
}

