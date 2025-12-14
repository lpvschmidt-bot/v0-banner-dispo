import { redirect } from "next/navigation"
import BannerForm from "./components/BannerForm"

export default function Home({ searchParams }: { searchParams: any }) {
  // Überprüfen Sie, ob das Codewort in der URL vorhanden ist
  const code = searchParams.code

  // Wenn kein Codewort vorhanden ist, leiten Sie zur gleichen Seite mit Codewort weiter
  if (!code || code !== "banner2024") {
    redirect("/?code=banner2024")
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-white text-center">Banner-Feed</h1>
        <div className="bg-white rounded-lg shadow-xl p-8">
          <BannerForm />
        </div>
      </div>
    </main>
  )
}

