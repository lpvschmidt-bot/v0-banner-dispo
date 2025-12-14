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
    <div className="border p-4 rounded-lg shadow-md bg-white">
      <h3 className="text-lg font-semibold mb-3">{banner.format}</h3>
      <a
        href={banner.zielUrlFinal}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        title={banner.altText || "Banner-Vorschau"}
        aria-label={`${banner.format} Banner: ${banner.altText || "Keine Beschreibung verfügbar"}`}
      >
        {banner.format === "Topbanner" && (
          <div className="bg-gray-200 flex items-center justify-center overflow-hidden" style={{ width: '468px', maxWidth: '100%' }}>
            {banner.creative ? (
              <img
                src={banner.creative}
                alt={banner.altText}
                className="w-full h-auto object-contain"
                style={{ maxWidth: '468px' }}
              />
            ) : (
              <div className="w-full py-8 text-center text-gray-400">468px breit</div>
            )}
          </div>
        )}
        {banner.format === "Rectangle" && (
          <div className="bg-gray-200 flex items-center justify-center overflow-hidden" style={{ width: '300px', maxWidth: '100%' }}>
            {banner.creative ? (
              <img
                src={banner.creative}
                alt={banner.altText}
                className="w-full h-auto object-contain"
                style={{ maxWidth: '300px' }}
              />
            ) : (
              <div className="w-full py-16 text-center text-gray-400">300px breit</div>
            )}
          </div>
        )}
        {banner.format === "Half-Page-Ad" && (
          <div className="bg-gray-200 flex items-center justify-center overflow-hidden" style={{ width: '300px', maxWidth: '100%' }}>
            {banner.creative ? (
              <img
                src={banner.creative}
                alt={banner.altText}
                className="w-full h-auto object-contain"
                style={{ maxWidth: '300px' }}
              />
            ) : (
              <div className="w-full py-32 text-center text-gray-400">300px breit</div>
            )}
          </div>
        )}
        {banner.format === "Bild-Text-Anzeige" && (
          <div className="flex flex-col space-y-4" style={{ maxWidth: '300px' }}>
            <div className="bg-gray-200 flex items-center justify-center overflow-hidden" style={{ width: '160px', maxWidth: '100%' }}>
              {banner.creative ? (
                <img
                  src={banner.creative}
                  alt={banner.altText}
                  className="w-full h-auto object-contain"
                  style={{ maxWidth: '160px' }}
                />
              ) : (
                <div className="w-full py-12 text-center text-gray-400 text-sm">160px breit</div>
              )}
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-semibold">{banner.headline || 'Headline'}</h4>
              <p className="text-sm">{banner.text || 'Text'}</p>
              <button
                className="px-4 py-2 rounded text-sm"
                style={{
                  color: banner.buttonTextColor || "#FFFFFF",
                  backgroundColor: banner.buttonBackgroundColor || "#098109",
                }}
                aria-label={banner.cta}
              >
                {banner.cta || 'mehr'}
              </button>
            </div>
          </div>
        )}
      </a>
      {banner.trackingPixel && (
        <img src={banner.trackingPixel} alt="Tracking Pixel" className="hidden" />
      )}
    </div>
  )
}

