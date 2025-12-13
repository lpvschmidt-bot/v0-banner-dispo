/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: experimental keys removed to match the Next.js version used
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Type",
            value: "text/html; charset=utf-8",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
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

