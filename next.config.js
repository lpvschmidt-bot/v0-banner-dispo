/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: experimental keys removed to match the Next.js version used
  // Keep API no-store header; avoid overriding Content-Type for static assets
  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

